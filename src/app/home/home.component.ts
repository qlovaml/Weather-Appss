import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeatherService } from '../service/weather.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedTemperatureUnit: string = 'celsius';
  subscriptions: any = [];
  searchForm!: FormGroup;
  weather: any;
  forecast: any = [];
  currentCity: string = 'Laguna';
  selectedDataToShow: string = 'heatIndex';
  cityNotFound: boolean = false; // Flag to indicate if city not found

  constructor(
    private fb: FormBuilder,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      city: ['', Validators.required]
    });

    this.loadFromLocalStorage();

    if (this.currentCity) {
      this.searchWeatherForCity(this.currentCity);
    }
  }

  searchWeatherForCity(city: string) {
    const formattedCity = city.replace(/\s+/g, '_');
    const encodedCity = encodeURIComponent(formattedCity);

    this.weatherService.searchWeather(encodedCity).subscribe(
      (resp) => {
        if (resp && resp.forecast && resp.forecast.forecastday) {
          this.weather = resp;
          this.currentCity = city;
          this.forecast = resp.forecast.forecastday;
          this.cityNotFound = false;
          this.updateWeatherData();
          this.saveToLocalStorage();
        } else {
          console.error('Invalid API response format:', resp);
          this.cityNotFound = true;
        }
      },
      (error) => {
        console.error('Error fetching weather data:', error);
        this.cityNotFound = true;
      }
    );
  }

  searchWeather() {
    const city = this.searchForm.get('city')!.value;
    if (city) {
      this.searchWeatherForCity(city);
    }
  }  
  
  toggleErrorDialog() {
    this.cityNotFound = false;
  }

  showLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          this.weatherService.searchWeatherByCoords(latitude, longitude).subscribe(
            (resp) => {
              if (resp && resp.location && resp.location.name && resp.forecast && resp.forecast.forecastday) {
                this.weather = resp;
                this.currentCity = resp.location.name;
                this.forecast = resp.forecast.forecastday;
                this.cityNotFound = false;
                this.updateWeatherData();
                this.saveToLocalStorage();
              } else {
                console.error('Invalid API response format:', resp);
                alert('Invalid API response format. Please try again later.');
                this.cityNotFound = true;
              }
            },
            (error) => {
              console.error('Error fetching weather data:', error);
              alert('Error fetching weather data. Please try again later.');
              this.cityNotFound = true;
            }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error getting your location. Please check your browser settings.');
          this.cityNotFound = true;
        }
      );
    } else {
      this.cityNotFound = true;
    }
  }

  updateWeatherData() {
    if (this.weather) {
      // No conversion logic needed as the weather data should already have both celsius and fahrenheit values
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('selectedTemperatureUnit', this.selectedTemperatureUnit);
    localStorage.setItem('currentCity', this.currentCity);
    localStorage.setItem('selectedDataToShow', this.selectedDataToShow);
    localStorage.setItem('weatherData', JSON.stringify({
      weather: this.weather,
      forecast: this.forecast
    }));
    console.log('Saved to local storage:', {
      selectedTemperatureUnit: this.selectedTemperatureUnit,
      currentCity: this.currentCity,
      selectedDataToShow: this.selectedDataToShow,
      weatherData: {
        weather: this.weather,
        forecast: this.forecast
      }
    });
  }

  loadFromLocalStorage() {
    const savedTemperatureUnit = localStorage.getItem('selectedTemperatureUnit');
    if (savedTemperatureUnit) {
      this.selectedTemperatureUnit = savedTemperatureUnit;
    }

    const savedCity = localStorage.getItem('currentCity');
    if (savedCity) {
      this.currentCity = savedCity;
    }

    const savedDataToShow = localStorage.getItem('selectedDataToShow');
    if (savedDataToShow) {
      this.selectedDataToShow = savedDataToShow;
    }

    const savedWeatherData = localStorage.getItem('weatherData');
    if (savedWeatherData) {
      const parsedWeatherData = JSON.parse(savedWeatherData);
      this.weather = parsedWeatherData.weather;
      this.forecast = parsedWeatherData.forecast;
    }

    console.log('Loaded from local storage:', {
      selectedTemperatureUnit: this.selectedTemperatureUnit,
      currentCity: this.currentCity,
      selectedDataToShow: this.selectedDataToShow,
      weatherData: {
        weather: this.weather,
        forecast: this.forecast
      }
    });
  }

  onTemperatureUnitChange() {
    this.saveToLocalStorage();
  }

  onDataToShowChange() {
    this.saveToLocalStorage();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: { unsubscribe: () => any; }) => sub.unsubscribe());
    Object.keys(this.weatherService['cache']).forEach(city => {
      this.weatherService['clearCache'](city);
    });
  }
}
