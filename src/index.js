import moment from 'moment'
import { getData, sortData } from './data'
import { renderData, populateDropdown, dropdownList } from './render'

let settings = { intlFormat: 'en-US', showZeroState: false, autoUpdate: 0 }

let newMaster = []              //holds 'cleaned up', sorted API data from both calls, with national summary as element 0
let rawData = []                //holds copy of downloaded API data
let addlData = []               // holds data from the second api call

let activeState = 0             //index of the default state
let updateTime = moment()

let url1 = 'https://api.covid19india.org/data.json'                     //National time series, statewise stats and test counts	(NOT Working!!!)
let url2 = 'https://api.covid19india.org/v2/state_district_wise.json'   //State-district-wise V2
// let url3 = 'https://api.covid19india.org/deaths_recoveries.json'     //Deaths and Recoveries


const cleanupRawData = () => {              //cleanup and save raw-data into masterData array, with a summary item as first element
let natSummary = []

for (let item in addlData.statewise) {

    newMaster.push({
        name: addlData.statewise[item].state,
        confirmed: addlData.statewise[item].confirmed,
        deltaconfirmed: addlData.statewise[item].deltaconfirmed,
        deaths: addlData.statewise[item].deaths,
        deltadeaths: addlData.statewise[item].deltadeaths,
        recovered: addlData.statewise[item].recovered,
        deltarecovered: addlData.statewise[item].deltarecovered,
        active: addlData.statewise[item].confirmed - addlData.statewise[item].recovered - addlData.statewise[item].deaths,
        deltaactive: addlData.statewise[item].deltaconfirmed - addlData.statewise[item].deltarecovered - addlData.statewise[item].deltadeaths
    })
        
    if (item > 0) {
        natSummary.push({
            name: newMaster[item].name,
            confirmed: newMaster[item].confirmed,
            deltaconfirmed: newMaster[item].deltaconfirmed,
            deaths: newMaster[item].deaths,
            deltadeaths: newMaster[item].deltadeaths,
            recovered: newMaster[item].recovered,
            deltarecovered: newMaster[item].deltarecovered
        })    
    }
}

for (let item in newMaster) {           //get district details added to each state 
    let distSummary = []

    for (let j in rawData) {
        if (newMaster[item].name.toLowerCase() == rawData[j].state.toLowerCase()) {
            // newMaster[item].districtData = {...rawData[j].districtData}
            //the above line is a simple one line replacement of the below for loop however, this copies the structure of the rawdata in terms of nested delta numbers within district data this is avoided now.
            
        for (let k in rawData[j].districtData) {
            distSummary.push({
                name: rawData[j].districtData[k].district,
                confirmed: rawData[j].districtData[k].confirmed,
                deltaconfirmed: rawData[j].districtData[k].delta.confirmed,
                recovered: rawData[j].districtData[k].recovered,
                deltarecovered: rawData[j].districtData[k].delta.recovered,
                deaths: rawData[j].districtData[k].deceased,
                deltadeaths: rawData[j].districtData[k].delta.deceased
            })
        }
        newMaster[item].districtData = distSummary
        } 
    } 
    if (!newMaster[item].districtData) {
        newMaster[item].districtData = []
    }
}

newMaster[0].name = "All States"
newMaster[0].districtData = [...natSummary]
sortData(newMaster, 'name')
console.log('NEW MASTER >>', newMaster)

// API data recociliation - for audit purpose only
let distDeltaConfirmed = 0
let i = 1       //exclude 'all states' item
for (i ; i < newMaster.length; i++) {
    for (let j in newMaster[i].districtData) {
    distDeltaConfirmed += Number(newMaster[i].districtData[j].deltaconfirmed)
    }
}
console.log(`New Cases > from State data: ${Number(newMaster[0].deltaconfirmed)}, from Dist data: ${distDeltaConfirmed}`)
}


const getAdditionalInfo = () => {                   //call this function to fetch additional info from url2
    getData(url1).then((apiData) => {               //get fatalities and recovery database
    addlData = {...apiData}                         //duplicate returned data to addlData
    
    cleanupRawData()                            //cleanup and and save in masterData
    populateDropdown()                          //populate drop down list
    renderData (activeState, 'confirmed')       //render masterData

}).catch((err) => {
    console.log(`Error: ${err}`)
    document.querySelector('#error-area').innerHTML = `<p class="error">error connecting to one of the data sources. recovery / fatality count unavailable.. please try again later</p>`
})
}

const getMainData = () => {

    getData(url2).then((apiData) => {
        updateTime = moment()
        rawData = {...apiData}                      //clone apiData
        getAdditionalInfo()                         // make the second API call

    }).catch((err) => {
        console.log(`Error: ${err}`)
        document.querySelector('#error-area').innerHTML = `<p class="error">Oops.. error connecting to data sources ... please try again later</p>`
    })
}

getMainData()

dropdownList.addEventListener('change',(e) => {
    console.log(dropdownList.value, newMaster[dropdownList.value].name)
    
    activeState = dropdownList.value
    renderData (activeState, 'confirmed')
    
})

/* document.querySelector('#data-table').addEventListener('clcik', (e) => {
    console.log(e)
}) */

export { updateTime, newMaster, activeState, settings }