import { capitalCity, city, country, defaultDistricts, district, simpleCountry } from './helpers'

export const ASIA_LOCATIONS = [
  simpleCountry('af', 'Afghanistan', 34.5553, 69.2075, 'Kabul'),
  simpleCountry('am', 'Armenia', 40.1792, 44.4991, 'Yerevan'),
  simpleCountry('az', 'Azerbaijan', 40.4093, 49.8671, 'Baku'),
  simpleCountry('bh', 'Bahrain', 26.2285, 50.586, 'Manama'),
  country('bd', 'Bangladesh', 23.8103, 90.4125, [
    capitalCity('bd', 'Dhaka', 23.8103, 90.4125, [
      district('bd-dhaka-gulshan', 'Gulshan', 23.7925, 90.4078),
      district('bd-dhaka-old-town', 'Old Town', 23.7104, 90.4074),
    ]),
    city('bd-chittagong', 'Chittagong', 22.3569, 91.7832, defaultDistricts('bd-chittagong', 22.3569, 91.7832)),
  ]),
  simpleCountry('bt', 'Bhutan', 27.4728, 89.639, 'Thimphu'),
  simpleCountry('bn', 'Brunei', 4.9031, 114.9398, 'Bandar Seri Begawan'),
  simpleCountry('kh', 'Cambodia', 11.5564, 104.9282, 'Phnom Penh'),
  country('cn', 'China', 39.9042, 116.4074, [
    capitalCity('cn', 'Beijing', 39.9042, 116.4074, [
      district('cn-beijing-dongcheng', 'Dongcheng', 39.9289, 116.4142),
      district('cn-beijing-chaoyang', 'Chaoyang', 39.9219, 116.4435),
    ]),
    city('cn-shanghai', 'Shanghai', 31.2304, 121.4737, [
      district('cn-shanghai-pudong', 'Pudong', 31.2215, 121.5444),
      district('cn-shanghai-huangpu', 'Huangpu', 31.2304, 121.4737),
    ]),
    city('cn-guangzhou', 'Guangzhou', 23.1291, 113.2644, defaultDistricts('cn-guangzhou', 23.1291, 113.2644)),
  ]),
  simpleCountry('cy', 'Cyprus', 35.1856, 33.3823, 'Nicosia'),
  simpleCountry('ge', 'Georgia', 41.7151, 44.8271, 'Tbilisi'),
  country('in', 'India', 28.6139, 77.209, [
    capitalCity('in', 'New Delhi', 28.6139, 77.209, [
      district('in-delhi-connaught', 'Connaught Place', 28.6315, 77.2167),
      district('in-delhi-south', 'South Delhi', 28.5244, 77.1855),
    ]),
    city('in-mumbai', 'Mumbai', 19.076, 72.8777, [
      district('in-mumbai-bandra', 'Bandra', 19.0596, 72.8295),
      district('in-mumbai-south', 'South Mumbai', 18.9388, 72.8354),
    ]),
    city('in-bangalore', 'Bangalore', 12.9716, 77.5946, defaultDistricts('in-bangalore', 12.9716, 77.5946)),
  ]),
  country('id', 'Indonesia', -6.2088, 106.8456, [
    capitalCity('id', 'Jakarta', -6.2088, 106.8456, [
      district('id-jakarta-central', 'Central Jakarta', -6.1751, 106.865),
      district('id-jakarta-south', 'South Jakarta', -6.2615, 106.8106),
    ]),
    city('id-surabaya', 'Surabaya', -7.2575, 112.7521, defaultDistricts('id-surabaya', -7.2575, 112.7521)),
  ]),
  country('ir', 'Iran', 35.6892, 51.389, [
    capitalCity('ir', 'Tehran', 35.6892, 51.389, [
      district('ir-tehran-north', 'North Tehran', 35.8019, 51.4241),
      district('ir-tehran-centro', 'Central Tehran', 35.6892, 51.389),
    ]),
    city('ir-isfahan', 'Isfahan', 32.6546, 51.668, defaultDistricts('ir-isfahan', 32.6546, 51.668)),
  ]),
  simpleCountry('iq', 'Iraq', 33.3152, 44.3661, 'Baghdad'),
  country('il', 'Israel', 31.7683, 35.2137, [
    capitalCity('il', 'Jerusalem', 31.7683, 35.2137, [
      district('il-jerusalem-old-city', 'Old City', 31.7767, 35.2345),
      district('il-jerusalem-west', 'West Jerusalem', 31.7857, 35.2007),
    ]),
    city('il-tel-aviv', 'Tel Aviv', 32.0853, 34.7818, defaultDistricts('il-tel-aviv', 32.0853, 34.7818)),
  ]),
  country('jp', 'Japan', 35.6762, 139.6503, [
    capitalCity('jp', 'Tokyo', 35.6762, 139.6503, [
      district('jp-tokyo-shibuya', 'Shibuya', 35.6595, 139.7004),
      district('jp-tokyo-shinjuku', 'Shinjuku', 35.6938, 139.7034),
    ]),
    city('jp-osaka', 'Osaka', 34.6937, 135.5023, defaultDistricts('jp-osaka', 34.6937, 135.5023)),
    city('jp-kyoto', 'Kyoto', 35.0116, 135.7681, defaultDistricts('jp-kyoto', 35.0116, 135.7681)),
  ]),
  simpleCountry('jo', 'Jordan', 31.9454, 35.9284, 'Amman'),
  country('kz', 'Kazakhstan', 51.1694, 71.4491, [
    capitalCity('kz', 'Astana', 51.1694, 71.4491),
    city('kz-almaty', 'Almaty', 43.222, 76.8512, defaultDistricts('kz-almaty', 43.222, 76.8512)),
  ]),
  simpleCountry('kw', 'Kuwait', 29.3759, 47.9774, 'Kuwait City'),
  simpleCountry('kg', 'Kyrgyzstan', 42.8746, 74.5698, 'Bishkek'),
  simpleCountry('la', 'Laos', 17.9757, 102.6331, 'Vientiane'),
  simpleCountry('lb', 'Lebanon', 33.8938, 35.5018, 'Beirut'),
  country('my', 'Malaysia', 3.139, 101.6869, [
    capitalCity('my', 'Kuala Lumpur', 3.139, 101.6869, [
      district('my-kl-bukit-bintang', 'Bukit Bintang', 3.1466, 101.7072),
      district('my-kl-klcc', 'KLCC', 3.1579, 101.7116),
    ]),
    city('my-george-town', 'George Town', 5.4141, 100.3288, defaultDistricts('my-george-town', 5.4141, 100.3288)),
  ]),
  simpleCountry('mv', 'Maldives', 4.1755, 73.5093, 'Male'),
  simpleCountry('mn', 'Mongolia', 47.8864, 106.9057, 'Ulaanbaatar'),
  country('mm', 'Myanmar', 19.7633, 96.0785, [
    capitalCity('mm', 'Naypyidaw', 19.7633, 96.0785),
    city('mm-yangon', 'Yangon', 16.8661, 96.1951, defaultDistricts('mm-yangon', 16.8661, 96.1951)),
  ]),
  simpleCountry('np', 'Nepal', 27.7172, 85.324, 'Kathmandu'),
  simpleCountry('kp', 'North Korea', 39.0392, 125.7625, 'Pyongyang'),
  simpleCountry('om', 'Oman', 23.588, 58.3829, 'Muscat'),
  country('pk', 'Pakistan', 33.6844, 73.0479, [
    capitalCity('pk', 'Islamabad', 33.6844, 73.0479),
    city('pk-karachi', 'Karachi', 24.8607, 67.0011, defaultDistricts('pk-karachi', 24.8607, 67.0011)),
    city('pk-lahore', 'Lahore', 31.5204, 74.3587, defaultDistricts('pk-lahore', 31.5204, 74.3587)),
  ]),
  simpleCountry('ps', 'Palestine', 31.9038, 35.2034, 'Ramallah'),
  country('ph', 'Philippines', 14.5995, 120.9842, [
    capitalCity('ph', 'Manila', 14.5995, 120.9842, [
      district('ph-manila-intramuros', 'Intramuros', 14.5906, 120.9755),
      district('ph-manila-makati', 'Makati', 14.5547, 121.0244),
    ]),
    city('ph-cebu', 'Cebu City', 10.3157, 123.8854, defaultDistricts('ph-cebu', 10.3157, 123.8854)),
  ]),
  simpleCountry('qa', 'Qatar', 25.2854, 51.531, 'Doha'),
  country('sa', 'Saudi Arabia', 24.7136, 46.6753, [
    capitalCity('sa', 'Riyadh', 24.7136, 46.6753, [
      district('sa-riyadh-olaya', 'Al Olaya', 24.7136, 46.6753),
      district('sa-riyadh-diplomatic', 'Diplomatic Quarter', 24.6877, 46.7219),
    ]),
    city('sa-jeddah', 'Jeddah', 21.4858, 39.1925, defaultDistricts('sa-jeddah', 21.4858, 39.1925)),
  ]),
  country('sg', 'Singapore', 1.3521, 103.8198, [
    city('sg-singapore', 'Singapore', 1.3521, 103.8198, [
      district('sg-marina-bay', 'Marina Bay', 1.2816, 103.8631),
      district('sg-orchard', 'Orchard', 1.3048, 103.8318),
      district('sg-chinatown', 'Chinatown', 1.2834, 103.8447),
    ]),
  ]),
  country('kr', 'South Korea', 37.5665, 126.978, [
    capitalCity('kr', 'Seoul', 37.5665, 126.978, [
      district('kr-seoul-gangnam', 'Gangnam', 37.4979, 127.0276),
      district('kr-seoul-jongno', 'Jongno', 37.5729, 126.9794),
    ]),
    city('kr-busan', 'Busan', 35.1796, 129.0756, defaultDistricts('kr-busan', 35.1796, 129.0756)),
  ]),
  simpleCountry('lk', 'Sri Lanka', 6.9271, 79.8612, 'Colombo'),
  simpleCountry('sy', 'Syria', 33.5138, 36.2765, 'Damascus'),
  country('tw', 'Taiwan', 25.033, 121.5654, [
    capitalCity('tw', 'Taipei', 25.033, 121.5654, [
      district('tw-taipei-xinyi', 'Xinyi', 25.033, 121.5654),
      district('tw-taipei-da-an', 'Daan', 25.026, 121.5435),
    ]),
    city('tw-kaohsiung', 'Kaohsiung', 22.6273, 120.3014, defaultDistricts('tw-kaohsiung', 22.6273, 120.3014)),
  ]),
  simpleCountry('tj', 'Tajikistan', 38.5598, 68.774, 'Dushanbe'),
  country('th', 'Thailand', 13.7563, 100.5018, [
    capitalCity('th', 'Bangkok', 13.7563, 100.5018, [
      district('th-bangkok-sukhumvit', 'Sukhumvit', 13.7307, 100.5418),
      district('th-bangkok-old-town', 'Old Town', 13.7563, 100.5018),
    ]),
    city('th-chiang-mai', 'Chiang Mai', 18.7883, 98.9853, defaultDistricts('th-chiang-mai', 18.7883, 98.9853)),
  ]),
  simpleCountry('tl', 'Timor-Leste', -8.5569, 125.5603, 'Dili'),
  country('tr', 'Turkey', 39.9334, 32.8597, [
    capitalCity('tr', 'Ankara', 39.9334, 32.8597),
    city('tr-istanbul', 'Istanbul', 41.0082, 28.9784, [
      district('tr-istanbul-sultanahmet', 'Sultanahmet', 41.0054, 28.9768),
      district('tr-istanbul-beyoglu', 'Beyoglu', 41.031, 28.976),
    ]),
  ]),
  simpleCountry('tm', 'Turkmenistan', 37.9601, 58.3261, 'Ashgabat'),
  country('ae', 'United Arab Emirates', 24.4539, 54.3773, [
    capitalCity('ae', 'Abu Dhabi', 24.4539, 54.3773),
    city('ae-dubai', 'Dubai', 25.2048, 55.2708, [
      district('ae-dubai-downtown', 'Downtown', 25.1972, 55.2744),
      district('ae-dubai-marina', 'Dubai Marina', 25.0805, 55.1403),
    ]),
  ]),
  country('uz', 'Uzbekistan', 41.2995, 69.2401, [
    capitalCity('uz', 'Tashkent', 41.2995, 69.2401),
    city('uz-samarkand', 'Samarkand', 39.6542, 66.9597, defaultDistricts('uz-samarkand', 39.6542, 66.9597)),
  ]),
  country('vn', 'Vietnam', 21.0285, 105.8542, [
    capitalCity('vn', 'Hanoi', 21.0285, 105.8542, [
      district('vn-hanoi-old-quarter', 'Old Quarter', 21.0285, 105.8542),
      district('vn-hanoi-tay-ho', 'Tay Ho', 21.0667, 105.8214),
    ]),
    city('vn-ho-chi-minh', 'Ho Chi Minh City', 10.8231, 106.6297, [
      district('vn-hcm-district-1', 'District 1', 10.7769, 106.7009),
      district('vn-hcm-district-3', 'District 3', 10.784, 106.6844),
    ]),
  ]),
  simpleCountry('ye', 'Yemen', 15.3694, 44.191, 'Sanaa'),
]
