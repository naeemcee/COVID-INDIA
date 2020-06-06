import moment from 'moment'
import { getData, cleanupRawData } from './data'
import { renderData } from './render'

let settings = { intlFormat: 'en-IN', showZeroState: false, autoUpdate: 0 }

let masterData = []              //holds 'cleaned up', sorted API data from both calls, with national summary as element 0
let rawData = []                //holds copy of downloaded API data
let addlData = []               // holds data from the second api call
let zoneInfo = []
let testInfo = []

let activeState = 0             //index of the default state
let updateTime = moment()

const homeButton = document.querySelector('#home-button')
const fwdButton = document.querySelector('#fwd-button')
const backButton = document.querySelector('#back-button')

const url1 = 'https://api.covid19india.org/data.json'                       //National time series, statewise stats and test counts
const url2 = 'https://api.covid19india.org/v2/state_district_wise.json'     //State-district-wise V2
const url3 = 'https://api.covid19india.org/zones.json'                      //Dist level zone information
const url4 = 'https://api.covid19india.org/state_test_data.json'            //Dist level tests data (NAt level avbl in url1)
// const url5 = 'https://api.covid19india.org/deaths_recoveries.json'       //Deaths and Recoveries

const getZoneInfo = () => {                                     //call this function to fetch additional info from url2
    getData(url3).then((zoneData) => {                          //get zone information
    zoneInfo = {...zoneData}                                    //duplicate returned data to zoneInfo
    // console.log(zoneInfo)

}).catch((err) => {
    console.log(`Error: ${err}`)
    document.querySelector('#error-area').innerHTML = `<p class="error">error retreiving zones info... please try again later</p>`
})
}

const getTestInfo = () => {                                     //call this function to fetch additional dstate level test info from url4
    getData(url4).then((testData) => {                          //get test information
    testInfo = {...testData}                                    //duplicate returned data to testInfo
    console.log(testInfo)

}).catch((err) => {
    console.log(`Error: ${err}`)
    document.querySelector('#error-area').innerHTML = `<p class="error">error retreiving test data... please try again later</p>`
})
}

const getAdditionalInfo = () => {                   //call this function to fetch additional info from url2
    getData(url1).then((apiData) => {               //get fatalities and recovery database
    addlData = {...apiData}                         //duplicate returned data to addlData
    
    cleanupRawData()                            //cleanup and and save in masterData
    renderData (activeState, 'confirmed')       //render masterData
    getTestInfo()
    getZoneInfo()
    
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

document.querySelector('#table-header-label-row').addEventListener('click', (e) => {
    let sortKey = 'name'
    if (e.srcElement.textContent.toLowerCase().includes('total')) sortKey = 'confirmed'
    if (e.srcElement.textContent.toLowerCase().includes('today')) sortKey = 'deltaconfirmed'
    if (e.srcElement.textContent.toLowerCase().includes('active')) sortKey = 'active'

    renderData(activeState, sortKey)
})

document.querySelector('#data-table').addEventListener('click', (e) => {
    document.querySelector('#sliding-menu').style.width = "0"   //close sliding menu if visible
    if (activeState !== 0) return
    let stateIndex, state
        
    renderData(activeState, 'confirmed')
    state = e.target.parentElement.children[1].textContent.toLowerCase()
    console.log(state)

    stateIndex = masterData.findIndex( x => x.name.toLowerCase() == state)
    activeState = stateIndex < 0 ? 0 : stateIndex
    renderData(activeState, 'confirmed')
})

homeButton.addEventListener ('click', (e) => {
    activeState = 0
    renderData(activeState, 'confirmed')
})

fwdButton.addEventListener ('click', (e) => {
    if(activeState < masterData[0].districtData.length) activeState ++
    renderData(activeState, 'confirmed')
})

backButton.addEventListener ('click', (e) => {
    if (activeState > 0) activeState --
    renderData(activeState, 'confirmed')
})

document.querySelector('#menu-button').addEventListener('click', (e) => {
    document.querySelector('#sliding-menu').style.width = "98%"
})

document.querySelector('.close-btn').addEventListener('click', (e) => {
    document.querySelector('#sliding-menu').style.width = "0"
})

document.querySelector('.btn-refresh').addEventListener('click', (e) => {
    location.reload(true)
})

document.getElementById('chk-numFormat').addEventListener('change', (e) => {
    console.log(e.target.checked)
    settings.intlFormat = (e.target.checked) ? 'en-IN' : 'en-US'
    //saveSettings()
    renderData(activeState, 'confirmed')
})

// window.addEventListener('scroll', (e) => {
//     console.log(e.target)
// })

export { updateTime, masterData, addlData, rawData, activeState, zoneInfo, testInfo, settings }