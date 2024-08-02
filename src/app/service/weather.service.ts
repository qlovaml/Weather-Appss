import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private baseUrl = 'http://localhost/weather-app/api/';
  private cache: { [city: string]: BehaviorSubject<any> } = {};

  constructor(private http: HttpClient) {}

  private formatCityName(city: string): string {
    return city.replace(/\s+/g, '_'); // Replace spaces with underscores
  }

  private formatCoords(latitude: number, longitude: number): string {
    return `${latitude}/${longitude}`;
  }

  fetchWeather(city: string): Observable<any> {
    const formattedCity = this.formatCityName(city);
    const url = `${this.baseUrl}weather/${formattedCity}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }
  
  searchWeather(city: string): Observable<any> {
    const formattedCity = this.formatCityName(city);
    const url = `${this.baseUrl}weather/${formattedCity}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }
  
  searchWeatherByLocation(city: string): Observable<any> {
    if (!this.cache[city]) {
      this.cache[city] = new BehaviorSubject<any>(null);
      const formattedCity = this.formatCityName(city);
      const url = `${this.baseUrl}weather/${formattedCity}`;
      this.http.get(url).subscribe(
        (data) => this.cache[city].next(data),
        (error) => console.error('Error fetching weather data:', error)
      );
    }
    return this.cache[city].asObservable();
  }

  searchWeatherByCoords(latitude: number, longitude: number): Observable<any> {
    console.log(`Searching weather by coords: ${latitude}, ${longitude}`);
    const formattedCoords = this.formatCoords(latitude, longitude);
    const url = `${this.baseUrl}weather-lat-lon/${formattedCoords}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  clearCache(city: string) {
    if (this.cache[city]) {
      this.cache[city].complete();
      delete this.cache[city];
    }
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
