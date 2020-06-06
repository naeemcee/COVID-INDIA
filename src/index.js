import moment from 'moment'
import { getData, cleanupRawData } from './data'
import { renderData } from './render'

let settings = { intlFormat: 'en-US', showZeroState: false, autoUpdate: 0 }

let masterData = []              //holds 'cleaned up', sorted API data from both calls, with national summary as element 0
let rawData = []                //holds copy of downloaded API data
let addlData = []               // holds data from the second api call

let activeState = 0             //index of the default state
let updateTime = moment()
let scrollIndex = activeState
let scrollForward = true

let homeButton = document.querySelector('#home-button')
let fwdButton = document.querySelector('#fwd-button')
let backButton = document.querySelector('#back-button')


let url1 = 'https://api.covid19india.org/data.json'                     //National time series, statewise stats and test counts	(NOT Working!!!)
let url2 = 'https://api.covid19india.org/v2/state_district_wise.json'   //State-district-wise V2
// let url3 = 'https://api.covid19india.org/deaths_recoveries.json'     //Deaths and Recoveries

const getAdditionalInfo = () => {                   //call this function to fetch additional info from url2
    getData(url1).then((apiData) => {               //get fatalities and recovery database
    addlData = {...apiData}                         //duplicate returned data to addlData
    
    cleanupRawData()                            //cleanup and and save in masterData
    // populateDropdown()                          //populate drop down list
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

document.querySelector('#table-header-label-row').addEventListener('click', (e) => {
    let sortKey = 'name'
    if (e.srcElement.textContent.toLowerCase().includes('total')) sortKey = 'confirmed'
    if (e.srcElement.textContent.toLowerCase().includes('today')) sortKey = 'deltaconfirmed'

    renderData(activeState, sortKey)
})


document.querySelector('#data-table').addEventListener('click', (e) => {
    // console.log('activeState: ', activeState)
    if (activeState !== 0) return
    
    // console.log(e.target.parentNode.childNodes[0].textContent)  
    // activeState = Number(e.target.parentElement.children[0].textContent)    //get the sl number of the clicked state / dist name
    
    renderData(activeState, 'confirmed')
    let state = e.target.parentElement.children[1].textContent.toLowerCase()
    
    
    masterData.forEach((item, index) => {
        if (state == masterData[index].name.toLowerCase()) {
            console.log(index)
            activeState = index
            scrollIndex = activeState
            renderData(activeState, 'confirmed')
        }
    })
})

homeButton.addEventListener ('click', (e) => {
    activeState = 0
    renderData(activeState, 'confirmed')
    homeButton.visibility = 'hidden'
    scrollIndex = 0
    scrollForward = true
})

/* fwdButton.addEventListener ('click', (e) => {
    if (activeState < newMaster[0].districtData.length) activeState ++ 
    renderData(activeState, 'confirmed')
}) */

fwdButton.addEventListener ('click', (e) => {
    console.log('scrollIndex:', scrollIndex)
    if(scrollIndex < masterData[0].districtData.length) {
        if (!scrollForward) scrollIndex ++
        for(let i = 0; i < masterData[0].districtData.length + 1; i++){
            if(masterData[0].districtData[scrollIndex].name == masterData[i].name)
            activeState = i
        }
        scrollIndex += 1
    } else return
    scrollForward = true
    renderData(activeState, 'confirmed')
})

backButton.addEventListener ('click', (e) => {
    // if (activeState > 0) activeState  
    // renderData(activeState, 'confirmed')

    console.log('scrollIndex:', scrollIndex)
    if(scrollForward) scrollIndex --
    if(scrollIndex > 0 ) {
        scrollIndex -= 1
        for(let i in masterData[0].districtData){
            if(masterData[0].districtData[scrollIndex].name == masterData[i].name)
            activeState = i
        }
    } else {
        activeState = 0
    }
    scrollForward = false
    renderData(activeState, 'confirmed')
})

document.querySelector('#menu-button').addEventListener('click', (e) => {
    document.querySelector('#sliding-menu').style.width = "90%"
})

document.querySelector('.close-btn').addEventListener('click', (e) => {
    document.querySelector('#sliding-menu').style.width = "0"
})

export { updateTime, masterData, addlData, rawData, activeState, settings }