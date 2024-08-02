<?php

require_once "global.php";

class Get extends GlobalMethod{

    private $apiKey;
    private $apiUrl;

    public function __construct() {
        $apiKeyAndUrl = $this->getApiKeyAndUrl();
        $this->apiKey = $apiKeyAndUrl['apiKey'];
        $this->apiUrl = $apiKeyAndUrl['apiUrl'];
    }

    public function fetchWeather($city, $days = 8) {
        $url = "{$this->apiUrl}?key={$this->apiKey}&q={$city}&days={$days}";
        return $this->fetchWeatherFromUrl($url);
    }

    public function searchWeatherByCoords($latitude, $longitude, $days = 8) {
        $url = "{$this->apiUrl}?key={$this->apiKey}&q={$latitude},{$longitude}&days={$days}";
        return $this->fetchWeatherFromUrl($url);
    }

    private function fetchWeatherFromUrl($url) {
        error_log("Fetching weather data from URL: $url");
        $response = @file_get_contents($url);

        if ($response === false) {
            return [
                'status' => 'error',
                'message' => 'Failed to fetch weather data from the API.'
            ];
        }

        $decodedResponse = json_decode($response, true);

        if ($decodedResponse === null) {
            return [
                'status' => 'error',
                'message' => 'Failed to decode weather data from the API.'
            ];
        }

        return $decodedResponse;
    }

    private function getApiKeyAndUrl() {
        return [
            'apiKey' => '01569b0e1ca3441db2a102656243007',
            'apiUrl' => 'http://api.weatherapi.com/v1/forecast.json'
        ];
    }
}

?>