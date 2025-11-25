package com.example.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate;
    private final String nominatimBaseUrl = "https://nominatim.openstreetmap.org";

    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }

    public String getCityFromCoordinates(BigDecimal latitude, BigDecimal longitude) {
        try {
            String url = String.format(
                    "%s/reverse?format=json&lat=%s&lon=%s&zoom=16&addressdetails=1",
                    nominatimBaseUrl,
                    latitude.toString(),
                    longitude.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "SwapIt-App/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<NominatimResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    NominatimResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                NominatimResponse body = response.getBody();
                return extractCityWithDistrict(body);
            }

            return null;

        } catch (Exception e) {
            return null;
        }
    }

    public CoordinatesResponse getCoordinatesFromCity(String city) {
        try {
            String url = String.format(
                    "%s/search?format=json&q=%s&limit=1&addressdetails=1",
                    nominatimBaseUrl,
                    URLEncoder.encode(city, StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TutorConnect/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<NominatimSearchResponse[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    NominatimSearchResponse[].class);

            if (response.getStatusCode().is2xxSuccessful() &&
                    response.getBody() != null &&
                    response.getBody().length > 0) {

                NominatimSearchResponse firstResult = response.getBody()[0];

                return new CoordinatesResponse(
                        new BigDecimal(firstResult.getLat()),
                        new BigDecimal(firstResult.getLon()));
            }

            return null;

        } catch (Exception e) {
            return null;
        }
    }

    private String extractCityWithDistrict(NominatimResponse response) {
        if (response.getAddress() == null) {
            return null;
        }

        NominatimAddress address = response.getAddress();

        String cityName = extractCityName(address);
        String districtName = extractDistrictName(address);

        if (cityName == null) {
            return null;
        }

        if (districtName != null && !districtName.equals(cityName)) {
            return cityName + ", " + districtName;
        }

        return cityName;
    }

    private String extractCityName(NominatimAddress address) {
        if (address.getCity() != null && !address.getCity().isBlank()) {
            return address.getCity();
        }
        if (address.getTown() != null && !address.getTown().isBlank()) {
            return address.getTown();
        }
        if (address.getVillage() != null && !address.getVillage().isBlank()) {
            return address.getVillage();
        }
        if (address.getMunicipality() != null && !address.getMunicipality().isBlank()) {
            return address.getMunicipality();
        }
        if (address.getCounty() != null && !address.getCounty().isBlank()) {
            return address.getCounty();
        }

        return null;
    }

    private String extractDistrictName(NominatimAddress address) {
        if (address.getSuburb() != null && !address.getSuburb().isBlank()) {
            return address.getSuburb();
        }
        if (address.getNeighbourhood() != null && !address.getNeighbourhood().isBlank()) {
            return address.getNeighbourhood();
        }
        if (address.getQuarter() != null && !address.getQuarter().isBlank()) {
            return address.getQuarter();
        }
        if (address.getCityDistrict() != null && !address.getCityDistrict().isBlank()) {
            return address.getCityDistrict();
        }

        return null;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NominatimSearchResponse {
        private String lat;
        private String lon;

        @JsonProperty("display_name")
        private String displayName;

        private NominatimAddress address;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NominatimResponse {
        private NominatimAddress address;

        @JsonProperty("display_name")
        private String displayName;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NominatimAddress {
        private String city;
        private String town;
        private String village;
        private String hamlet;
        private String municipality;
        private String county;
        private String state;
        private String country;

        private String suburb;
        private String neighbourhood;
        private String quarter;

        @JsonProperty("city_district")
        private String cityDistrict;

        @JsonProperty("country_code")
        private String countryCode;
    }

    public record CoordinatesResponse(BigDecimal latitude, BigDecimal longitude) {
    }
}
