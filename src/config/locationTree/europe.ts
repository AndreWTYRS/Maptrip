import { capitalCity, city, country, defaultDistricts, district, simpleCountry } from './helpers'

export const EUROPE_LOCATIONS = [
  simpleCountry('al', 'Albania', 41.3275, 19.8187, 'Tirana'),
  simpleCountry('ad', 'Andorra', 42.5063, 1.5218, 'Andorra la Vella'),
  country('at', 'Austria', 48.2082, 16.3738, [
    capitalCity('at', 'Vienna', 48.2082, 16.3738, [
      district('at-vienna-innere-stadt', 'Innere Stadt', 48.2082, 16.3738),
      district('at-vienna-leopoldstadt', 'Leopoldstadt', 48.2165, 16.3959),
    ]),
    city('at-salzburg', 'Salzburg', 47.8095, 13.055, defaultDistricts('at-salzburg', 47.8095, 13.055)),
  ]),
  country('by', 'Belarus', 53.9045, 27.5615, [
    capitalCity('by', 'Minsk', 53.9045, 27.5615),
    city('by-brest', 'Brest', 52.0976, 23.7341, defaultDistricts('by-brest', 52.0976, 23.7341)),
  ]),
  country('be', 'Belgium', 50.8503, 4.3517, [
    capitalCity('be', 'Brussels', 50.8503, 4.3517, [
      district('be-brussels-grand-place', 'Grand Place', 50.8466, 4.3528),
      district('be-brussels-eu-quarter', 'EU Quarter', 50.8436, 4.382),
    ]),
    city('be-antwerp', 'Antwerp', 51.2194, 4.4025, defaultDistricts('be-antwerp', 51.2194, 4.4025)),
  ]),
  simpleCountry('ba', 'Bosnia and Herzegovina', 43.8563, 18.4131, 'Sarajevo'),
  simpleCountry('bg', 'Bulgaria', 42.6977, 23.3219, 'Sofia'),
  simpleCountry('hr', 'Croatia', 45.815, 15.9819, 'Zagreb'),
  country('cz', 'Czechia', 50.0755, 14.4378, [
    capitalCity('cz', 'Prague', 50.0755, 14.4378, [
      district('cz-prague-old-town', 'Old Town', 50.0875, 14.4213),
      district('cz-prague-mala-strana', 'Mala Strana', 50.0878, 14.4035),
    ]),
    city('cz-brno', 'Brno', 49.1951, 16.6068, defaultDistricts('cz-brno', 49.1951, 16.6068)),
  ]),
  country('dk', 'Denmark', 55.6761, 12.5683, [
    capitalCity('dk', 'Copenhagen', 55.6761, 12.5683, [
      district('dk-copenhagen-indre-by', 'Indre By', 55.6761, 12.5683),
      district('dk-copenhagen-norrebro', 'Norrebro', 55.6996, 12.5439),
    ]),
    city('dk-aarhus', 'Aarhus', 56.1629, 10.2039, defaultDistricts('dk-aarhus', 56.1629, 10.2039)),
  ]),
  simpleCountry('ee', 'Estonia', 59.437, 24.7536, 'Tallinn'),
  simpleCountry('fi', 'Finland', 60.1699, 24.9384, 'Helsinki'),
  country('fr', 'France', 48.8566, 2.3522, [
    capitalCity('fr', 'Paris', 48.8566, 2.3522, [
      district('fr-paris-marais', 'Le Marais', 48.8566, 2.3622),
      district('fr-paris-montmartre', 'Montmartre', 48.8867, 2.3431),
    ]),
    city('fr-lyon', 'Lyon', 45.764, 4.8357, defaultDistricts('fr-lyon', 45.764, 4.8357)),
    city('fr-marseille', 'Marseille', 43.2965, 5.3698, defaultDistricts('fr-marseille', 43.2965, 5.3698)),
  ]),
  country('de', 'Germany', 52.52, 13.405, [
    capitalCity('de', 'Berlin', 52.52, 13.405, [
      district('de-berlin-mitte', 'Mitte', 52.52, 13.405),
      district('de-berlin-kreuzberg', 'Kreuzberg', 52.4986, 13.403),
    ]),
    city('de-munich', 'Munich', 48.1351, 11.582, defaultDistricts('de-munich', 48.1351, 11.582)),
    city('de-hamburg', 'Hamburg', 53.5511, 9.9937, defaultDistricts('de-hamburg', 53.5511, 9.9937)),
  ]),
  country('gr', 'Greece', 37.9838, 23.7275, [
    capitalCity('gr', 'Athens', 37.9838, 23.7275, [
      district('gr-athens-plaka', 'Plaka', 37.9715, 23.7267),
      district('gr-athens-kolonaki', 'Kolonaki', 37.9778, 23.7418),
    ]),
    city('gr-thessaloniki', 'Thessaloniki', 40.6401, 22.9444, defaultDistricts('gr-thessaloniki', 40.6401, 22.9444)),
  ]),
  simpleCountry('hu', 'Hungary', 47.4979, 19.0402, 'Budapest'),
  simpleCountry('is', 'Iceland', 64.1466, -21.9426, 'Reykjavik'),
  country('ie', 'Ireland', 53.3498, -6.2603, [
    capitalCity('ie', 'Dublin', 53.3498, -6.2603, [
      district('ie-dublin-temple-bar', 'Temple Bar', 53.3456, -6.2644),
      district('ie-dublin-docklands', 'Docklands', 53.3478, -6.2389),
    ]),
    city('ie-cork', 'Cork', 51.8985, -8.4756, defaultDistricts('ie-cork', 51.8985, -8.4756)),
  ]),
  country('it', 'Italy', 41.9028, 12.4964, [
    capitalCity('it', 'Rome', 41.9028, 12.4964, [
      district('it-rome-centro-storico', 'Centro Storico', 41.9028, 12.4964),
      district('it-rome-trastevere', 'Trastevere', 41.8895, 12.4692),
    ]),
    city('it-milan', 'Milan', 45.4642, 9.19, defaultDistricts('it-milan', 45.4642, 9.19)),
    city('it-naples', 'Naples', 40.8518, 14.2681, defaultDistricts('it-naples', 40.8518, 14.2681)),
  ]),
  simpleCountry('xk', 'Kosovo', 42.6629, 21.1655, 'Pristina'),
  simpleCountry('lv', 'Latvia', 56.9496, 24.1052, 'Riga'),
  simpleCountry('li', 'Liechtenstein', 47.141, 9.5209, 'Vaduz'),
  simpleCountry('lt', 'Lithuania', 54.6872, 25.2797, 'Vilnius'),
  simpleCountry('lu', 'Luxembourg', 49.6116, 6.1319, 'Luxembourg'),
  simpleCountry('mt', 'Malta', 35.8989, 14.5146, 'Valletta'),
  simpleCountry('md', 'Moldova', 47.0105, 28.8638, 'Chisinau'),
  simpleCountry('mc', 'Monaco', 43.7384, 7.4246, 'Monaco'),
  simpleCountry('me', 'Montenegro', 42.4304, 19.2594, 'Podgorica'),
  country('nl', 'Netherlands', 52.3676, 4.9041, [
    capitalCity('nl', 'Amsterdam', 52.3676, 4.9041, [
      district('nl-amsterdam-centrum', 'Centrum', 52.3676, 4.9041),
      district('nl-amsterdam-jordaan', 'Jordaan', 52.3747, 4.8816),
    ]),
    city('nl-rotterdam', 'Rotterdam', 51.9244, 4.4777, defaultDistricts('nl-rotterdam', 51.9244, 4.4777)),
  ]),
  simpleCountry('mk', 'North Macedonia', 41.9981, 21.4254, 'Skopje'),
  country('no', 'Norway', 59.9139, 10.7522, [
    capitalCity('no', 'Oslo', 59.9139, 10.7522, [
      district('no-oslo-sentrum', 'Sentrum', 59.9139, 10.7522),
      district('no-oslo-grunerlokka', 'Grunerlokka', 59.9236, 10.7579),
    ]),
    city('no-bergen', 'Bergen', 60.3913, 5.3221, defaultDistricts('no-bergen', 60.3913, 5.3221)),
  ]),
  country('pl', 'Poland', 52.2297, 21.0122, [
    capitalCity('pl', 'Warsaw', 52.2297, 21.0122, [
      district('pl-warsaw-old-town', 'Old Town', 52.2497, 21.0122),
      district('pl-warsaw-mokotow', 'Mokotow', 52.193, 21.0266),
    ]),
    city('pl-krakow', 'Krakow', 50.0647, 19.945, defaultDistricts('pl-krakow', 50.0647, 19.945)),
  ]),
  country('pt', 'Portugal', 38.7223, -9.1393, [
    capitalCity('pt', 'Lisbon', 38.7223, -9.1393, [
      district('pt-lisbon-alfama', 'Alfama', 38.7125, -9.1306),
      district('pt-lisbon-bairro-alto', 'Bairro Alto', 38.7139, -9.1444),
    ]),
    city('pt-porto', 'Porto', 41.1579, -8.6291, defaultDistricts('pt-porto', 41.1579, -8.6291)),
  ]),
  simpleCountry('ro', 'Romania', 44.4268, 26.1025, 'Bucharest'),
  country('ru', 'Russia', 55.7558, 37.6173, [
    city('ru-moscow', 'Moscow', 55.7558, 37.6173, [
      district('ru-moscow-arbat', 'Arbat', 55.752, 37.592),
      district('ru-moscow-tverskoy', 'Tverskoy', 55.764, 37.61),
      district('ru-moscow-kitay', 'Kitay-gorod', 55.756, 37.634),
      district('ru-moscow-zamoskvorechye', 'Zamoskvorechye', 55.735, 37.637),
    ]),
    city('ru-spb', 'Saint Petersburg', 59.9343, 30.3351, [
      district('ru-spb-centro', 'Central District', 59.9343, 30.3351),
      district('ru-spb-vasileostrovsky', 'Vasileostrovsky', 59.942, 30.278),
    ]),
    city('ru-kazan', 'Kazan', 55.7887, 49.1221, defaultDistricts('ru-kazan', 55.7887, 49.1221)),
  ]),
  simpleCountry('sm', 'San Marino', 43.9424, 12.4578, 'San Marino'),
  simpleCountry('rs', 'Serbia', 44.7866, 20.4489, 'Belgrade'),
  simpleCountry('sk', 'Slovakia', 48.1486, 17.1077, 'Bratislava'),
  simpleCountry('si', 'Slovenia', 46.0569, 14.5058, 'Ljubljana'),
  country('es', 'Spain', 40.4168, -3.7038, [
    capitalCity('es', 'Madrid', 40.4168, -3.7038, [
      district('es-madrid-centro', 'Centro', 40.4168, -3.7038),
      district('es-madrid-salamanca', 'Salamanca', 40.43, -3.6795),
    ]),
    city('es-barcelona', 'Barcelona', 41.3874, 2.1686, [
      district('es-barcelona-gothic', 'Gothic Quarter', 41.3839, 2.1763),
      district('es-barcelona-eixample', 'Eixample', 41.3927, 2.1649),
    ]),
  ]),
  country('se', 'Sweden', 59.3293, 18.0686, [
    capitalCity('se', 'Stockholm', 59.3293, 18.0686, [
      district('se-stockholm-gamla-stan', 'Gamla Stan', 59.3251, 18.0708),
      district('se-stockholm-sodermalm', 'Sodermalm', 59.3127, 18.076),
    ]),
    city('se-gothenburg', 'Gothenburg', 57.7089, 11.9746, defaultDistricts('se-gothenburg', 57.7089, 11.9746)),
  ]),
  country('ch', 'Switzerland', 46.948, 7.4474, [
    capitalCity('ch', 'Bern', 46.948, 7.4474),
    city('ch-zurich', 'Zurich', 47.3769, 8.5417, defaultDistricts('ch-zurich', 47.3769, 8.5417)),
    city('ch-geneva', 'Geneva', 46.2044, 6.1432, defaultDistricts('ch-geneva', 46.2044, 6.1432)),
  ]),
  country('ua', 'Ukraine', 50.4501, 30.5234, [
    capitalCity('ua', 'Kyiv', 50.4501, 30.5234, [
      district('ua-kyiv-podil', 'Podil', 50.4687, 30.517),
      district('ua-kyiv-pechersk', 'Pechersk', 50.4265, 30.5383),
    ]),
    city('ua-lviv', 'Lviv', 49.8397, 24.0297, defaultDistricts('ua-lviv', 49.8397, 24.0297)),
    city('ua-odesa', 'Odesa', 46.4825, 30.7233, defaultDistricts('ua-odesa', 46.4825, 30.7233)),
  ]),
  country('gb', 'United Kingdom', 51.5074, -0.1278, [
    city('gb-london', 'London', 51.5074, -0.1278, [
      district('gb-london-westminster', 'Westminster', 51.4975, -0.1357),
      district('gb-london-camden', 'Camden', 51.539, -0.1426),
      district('gb-london-shoreditch', 'Shoreditch', 51.526, -0.078),
    ]),
    city('gb-edinburgh', 'Edinburgh', 55.9533, -3.1883, defaultDistricts('gb-edinburgh', 55.9533, -3.1883)),
    city('gb-manchester', 'Manchester', 53.4808, -2.2426, defaultDistricts('gb-manchester', 53.4808, -2.2426)),
  ]),
  simpleCountry('va', 'Vatican City', 41.9029, 12.4534, 'Vatican City'),
]
