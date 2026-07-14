import { capitalCity, city, country, defaultDistricts, district, simpleCountry } from './helpers'

export const AMERICAS_LOCATIONS = [
  simpleCountry('ag', 'Antigua and Barbuda', 17.1274, -61.8468, "St. John's"),
  country('ar', 'Argentina', -34.6037, -58.3816, [
    capitalCity('ar', 'Buenos Aires', -34.6037, -58.3816, [
      district('ar-ba-palermo', 'Palermo', -34.5889, -58.4306),
      district('ar-ba-recoleta', 'Recoleta', -34.5875, -58.3974),
    ]),
    city('ar-cordoba', 'Cordoba', -31.4201, -64.1888, defaultDistricts('ar-cordoba', -31.4201, -64.1888)),
  ]),
  simpleCountry('bs', 'Bahamas', 25.0443, -77.3504, 'Nassau'),
  simpleCountry('bb', 'Barbados', 13.0975, -59.6167, 'Bridgetown'),
  simpleCountry('bz', 'Belize', 17.251, -88.759, 'Belmopan'),
  country('bo', 'Bolivia', -16.4897, -68.1193, [
    city('bo-la-paz', 'La Paz', -16.4897, -68.1193, defaultDistricts('bo-la-paz', -16.4897, -68.1193)),
    capitalCity('bo', 'Sucre', -19.0196, -65.2619),
  ]),
  country('br', 'Brazil', -15.7939, -47.8828, [
    capitalCity('br', 'Brasilia', -15.7939, -47.8828),
    city('br-sao-paulo', 'Sao Paulo', -23.5505, -46.6333, [
      district('br-sp-jardins', 'Jardins', -23.5614, -46.656),
      district('br-sp-centro', 'Centro', -23.5505, -46.6333),
    ]),
    city('br-rio', 'Rio de Janeiro', -22.9068, -43.1729, [
      district('br-rio-copacabana', 'Copacabana', -22.9711, -43.1822),
      district('br-rio-centro', 'Centro', -22.9068, -43.1729),
    ]),
  ]),
  country('ca', 'Canada', 45.4215, -75.6972, [
    capitalCity('ca', 'Ottawa', 45.4215, -75.6972),
    city('ca-toronto', 'Toronto', 43.6532, -79.3832, [
      district('ca-toronto-downtown', 'Downtown', 43.6532, -79.3832),
      district('ca-toronto-north-york', 'North York', 43.7615, -79.4111),
    ]),
    city('ca-vancouver', 'Vancouver', 49.2827, -123.1207, defaultDistricts('ca-vancouver', 49.2827, -123.1207)),
  ]),
  country('cl', 'Chile', -33.4489, -70.6693, [
    capitalCity('cl', 'Santiago', -33.4489, -70.6693, [
      district('cl-santiago-providencia', 'Providencia', -33.4372, -70.6136),
      district('cl-santiago-centro', 'Centro', -33.4489, -70.6693),
    ]),
    city('cl-valparaiso', 'Valparaiso', -33.0472, -71.6127, defaultDistricts('cl-valparaiso', -33.0472, -71.6127)),
  ]),
  country('co', 'Colombia', 4.711, -74.0721, [
    capitalCity('co', 'Bogota', 4.711, -74.0721, [
      district('co-bogota-chapinero', 'Chapinero', 4.6533, -74.0636),
      district('co-bogota-la-candelaria', 'La Candelaria', 4.5981, -74.0758),
    ]),
    city('co-medellin', 'Medellin', 6.2476, -75.5658, defaultDistricts('co-medellin', 6.2476, -75.5658)),
  ]),
  simpleCountry('cr', 'Costa Rica', 9.9281, -84.0907, 'San Jose'),
  simpleCountry('cu', 'Cuba', 23.1136, -82.3666, 'Havana'),
  simpleCountry('dm', 'Dominica', 15.3092, -61.3794, 'Roseau'),
  simpleCountry('do', 'Dominican Republic', 18.4861, -69.9312, 'Santo Domingo'),
  country('ec', 'Ecuador', -0.1807, -78.4678, [
    capitalCity('ec', 'Quito', -0.1807, -78.4678),
    city('ec-guayaquil', 'Guayaquil', -2.1894, -79.8891, defaultDistricts('ec-guayaquil', -2.1894, -79.8891)),
  ]),
  simpleCountry('sv', 'El Salvador', 13.6929, -89.2182, 'San Salvador'),
  simpleCountry('gd', 'Grenada', 12.0561, -61.7488, "St. George's"),
  simpleCountry('gt', 'Guatemala', 14.6349, -90.5069, 'Guatemala City'),
  simpleCountry('gy', 'Guyana', 6.8013, -58.1551, 'Georgetown'),
  simpleCountry('ht', 'Haiti', 18.5944, -72.3074, 'Port-au-Prince'),
  simpleCountry('hn', 'Honduras', 14.0723, -87.1921, 'Tegucigalpa'),
  simpleCountry('jm', 'Jamaica', 18.0179, -76.8099, 'Kingston'),
  country('mx', 'Mexico', 19.4326, -99.1332, [
    capitalCity('mx', 'Mexico City', 19.4326, -99.1332, [
      district('mx-cdmx-polanco', 'Polanco', 19.4333, -99.2),
      district('mx-cdmx-centro', 'Centro Historico', 19.4326, -99.1332),
    ]),
    city('mx-guadalajara', 'Guadalajara', 20.6597, -103.3496, defaultDistricts('mx-guadalajara', 20.6597, -103.3496)),
    city('mx-monterrey', 'Monterrey', 25.6866, -100.3161, defaultDistricts('mx-monterrey', 25.6866, -100.3161)),
  ]),
  simpleCountry('ni', 'Nicaragua', 12.1149, -86.2362, 'Managua'),
  simpleCountry('pa', 'Panama', 8.9824, -79.5199, 'Panama City'),
  simpleCountry('py', 'Paraguay', -25.2637, -57.5759, 'Asuncion'),
  country('pe', 'Peru', -12.0464, -77.0428, [
    capitalCity('pe', 'Lima', -12.0464, -77.0428, [
      district('pe-lima-miraflores', 'Miraflores', -12.1196, -77.0365),
      district('pe-lima-centro', 'Centro Historico', -12.0464, -77.0428),
    ]),
    city('pe-cusco', 'Cusco', -13.5319, -71.9675, defaultDistricts('pe-cusco', -13.5319, -71.9675)),
  ]),
  simpleCountry('kn', 'Saint Kitts and Nevis', 17.3026, -62.7177, 'Basseterre'),
  simpleCountry('lc', 'Saint Lucia', 14.0101, -60.9875, 'Castries'),
  simpleCountry('vc', 'Saint Vincent and the Grenadines', 13.1579, -61.2248, 'Kingstown'),
  simpleCountry('sr', 'Suriname', 5.852, -55.2038, 'Paramaribo'),
  simpleCountry('tt', 'Trinidad and Tobago', 10.6918, -61.2225, 'Port of Spain'),
  country('us', 'United States', 38.9072, -77.0369, [
    city('us-washington', 'Washington, D.C.', 38.9072, -77.0369, [
      district('us-dc-capitol-hill', 'Capitol Hill', 38.8899, -77.0091),
      district('us-dc-georgetown', 'Georgetown', 38.9097, -77.0654),
    ]),
    city('us-nyc', 'New York', 40.7128, -74.006, [
      district('us-nyc-manhattan', 'Manhattan', 40.758, -73.9855),
      district('us-nyc-brooklyn', 'Brooklyn', 40.6782, -73.9442),
    ]),
    city('us-la', 'Los Angeles', 34.0522, -118.2437, [
      district('us-la-hollywood', 'Hollywood', 34.0928, -118.3287),
      district('us-la-downtown', 'Downtown', 34.0407, -118.2468),
    ]),
    city('us-chicago', 'Chicago', 41.8781, -87.6298, defaultDistricts('us-chicago', 41.8781, -87.6298)),
  ]),
  simpleCountry('uy', 'Uruguay', -34.9011, -56.1645, 'Montevideo'),
  simpleCountry('ve', 'Venezuela', 10.4806, -66.9036, 'Caracas'),
]
