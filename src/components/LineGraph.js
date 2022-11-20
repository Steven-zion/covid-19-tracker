import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import numeral from 'numeral'

const options = {
    legend: {
        display: false,
    },
    elements: {
        point: {
            radius: 0,
        },
    },
    maintainAspectRatio: false,
    tooltips: {
        mode: 'index',
        intersect: false,
        callbacks: {
            label: function (tooltipItem, data) {
                return numeral(tooltipItem.value).format('+0,0')
            },
        },
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    display: false,
                },
                ticks: {
                    callback: function (value, index, values) {
                        return numeral(value).format('0a');
                    },
                },
            },
        ],
        yAxes: [
            {
                type: 'time',
                time: {
                    format: 'HH:mm:ss',
                    tooltipFormat: 'll',
                },
            },
        ],
    },
};

const LineGraph = ({ casesType="cases" }) => {
    const [data, setData] = useState({})

    const buildChartData = (data, caseType) => {
        const chartData = []
        let lastPoint;
        for(let time in data.cases){
            if(lastPoint) {
                const newPoint = {
                    x: data[caseType][time] - lastPoint,
                    y: time
                }
                chartData.push(newPoint)
            }
            lastPoint = data[caseType][time]
        }
        return chartData
    }

    useEffect(() => {
        const fetchData = async () => {
            fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=120')
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    const chartData = buildChartData(data, casesType)
                    setData(chartData)
            })
        }
        fetchData()
    }, [casesType])

    return (
        <div>
            {data?.length > 0 && (
                <Line 
                    options={options}
                    data={{
                        datasets: [{
                            backgroundColor: "rgba(204, 16, 52, 0.5)",
                            borderColor: "#001", 
                            data: data
                        }]
                    }}  
                />
            )}
        </div>
    )
}

export default LineGraph
