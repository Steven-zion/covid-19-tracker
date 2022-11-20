import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import Table from './components/Table';
import { sortData, prettyPrintStat } from './util';
import numeral from "numeral";
import LineGraph from './components/LineGraph';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 1.2921, lng: 36.8219 })
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases");

  const options = {
      method: 'GET',
      url: 'https://covid-193.p.rapidapi.com/statistics',
      headers: {
          'X-RapidAPI-Key':
              process.env.COVID19_APP_RAPID_API_KEY,
          'X-RapidAPI-Host': 'covid-193.p.rapidapi.com',
      },
  };
  useEffect(() => {
    const getData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries", options)
        .then(response => response.json())
        .then(data => {
          const countries = data.map(item => (
            {
              name: item.country,
              value: item.countryInfo.iso2
            }
          ))
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }
    getData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => setCountryInfo(data))
  },[])
  const onCountryChange = async e => {
    const url = e.target.value === 'worldwide' ? 
    'https://disease.sh/v3/covid-19/all' : 
    `https://disease.sh/v3/covid-19/countries/${e.target.value}`

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setCountry(e.target.value)
        setCountryInfo(data)
        setMapCenter(!mapCenter ? [data.countryInfo.lat, data.countryInfo.long] : { lat: 1.2921, lng: 36.8219 })
        setMapZoom(4)
      })
  }
  return (
      <div className="app">
          <div className="app__left">
              <div className="app__header">
                  <h1>Cyhealth - covid-19 analysis </h1>
                  <FormControl className="app__dropdown">
                      <Select
                          className="dropdown"
                          variant="outlined"
                          value={country}
                          onChange={onCountryChange}
                      >
                          <MenuItem className="dropdown" name="worldwide" value="worldwide">
                              Worldwide
                          </MenuItem>
                          {countries.map((country) => (
                              <MenuItem value={country.value}>
                                  {country.name}
                              </MenuItem>
                          ))}
                      </Select>
                  </FormControl>
              </div>
              <div className="app__stats">
                  <InfoBox
                      onClick={(e) => setCasesType('cases')}
                      title="Coronavirus Cases"
                      active={casesType === 'cases'}
                      cases={prettyPrintStat(countryInfo.todayCases)}
                      total={numeral(countryInfo.cases).format('0.0a')}
                  />
                  <InfoBox
                      onClick={(e) => setCasesType('recovered')}
                      title="Recovered"
                      isGreen
                      active={casesType === 'recovered'}
                      cases={prettyPrintStat(countryInfo.todayRecovered)}
                      total={numeral(countryInfo.recovered).format('0.0a')}
                  />
                  <InfoBox
                      onClick={(e) => setCasesType('deaths')}
                      title="Deaths"
                      active={casesType === 'deaths'}
                      cases={prettyPrintStat(countryInfo.todayDeaths)}
                      total={numeral(countryInfo.deaths).format('0.0a')}
                  />
              </div>
              <Map
                  countries={mapCountries}
                  casesType={casesType}
                  center={mapCenter}
                  zoom={mapZoom}
              />
          </div>
          <Card className="app__right">
              <CardContent>
                  <h3>Live Cases by Country</h3>
                  <Table countries={tableData} />
                  <h3 style={{ marginTop: '25px' }}>
                      World wide new {casesType}
                  </h3>
                  <LineGraph casesType={casesType} />
              </CardContent>
          </Card>
      </div>
  );
}

export default App;
