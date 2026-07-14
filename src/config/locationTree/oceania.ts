import { capitalCity, city, country, defaultDistricts, district, simpleCountry } from './helpers'

export const OCEANIA_LOCATIONS = [
  country('au', 'Australia', -35.2809, 149.13, [
    capitalCity('au', 'Canberra', -35.2809, 149.13),
    city('au-sydney', 'Sydney', -33.8688, 151.2093, [
      district('au-sydney-cbd', 'CBD', -33.8688, 151.2093),
      district('au-sydney-bondi', 'Bondi', -33.8915, 151.2767),
    ]),
    city('au-melbourne', 'Melbourne', -37.8136, 144.9631, [
      district('au-melbourne-cbd', 'CBD', -37.8136, 144.9631),
      district('au-melbourne-fitzroy', 'Fitzroy', -37.7984, 144.9788),
    ]),
  ]),
  simpleCountry('fj', 'Fiji', -18.1416, 178.4419, 'Suva'),
  simpleCountry('ki', 'Kiribati', 1.3291, 172.979, 'South Tarawa'),
  simpleCountry('mh', 'Marshall Islands', 7.0897, 171.3805, 'Majuro'),
  simpleCountry('fm', 'Micronesia', 6.9147, 158.161, 'Palikir'),
  simpleCountry('nr', 'Nauru', -0.5477, 166.9209, 'Yaren'),
  country('nz', 'New Zealand', -41.2865, 174.7762, [
    capitalCity('nz', 'Wellington', -41.2865, 174.7762, [
      district('nz-wellington-cbd', 'CBD', -41.2865, 174.7762),
      district('nz-wellington-te-aro', 'Te Aro', -41.2934, 174.7756),
    ]),
    city('nz-auckland', 'Auckland', -36.8509, 174.7645, defaultDistricts('nz-auckland', -36.8509, 174.7645)),
  ]),
  simpleCountry('pw', 'Palau', 7.5004, 134.6243, 'Ngerulmud'),
  simpleCountry('pg', 'Papua New Guinea', -9.4438, 147.1803, 'Port Moresby'),
  simpleCountry('ws', 'Samoa', -13.8507, -171.7514, 'Apia'),
  simpleCountry('sb', 'Solomon Islands', -9.428, 159.9498, 'Honiara'),
  simpleCountry('to', 'Tonga', -21.1393, -175.2049, "Nuku'alofa"),
  simpleCountry('tv', 'Tuvalu', -8.5243, 179.1942, 'Funafuti'),
  simpleCountry('vu', 'Vanuatu', -17.7333, 168.3273, 'Port Vila'),
]
