
let dropdownList = document.querySelector('#dd-list')
let tableHeaderRow = document.querySelectorAll('#table-header-row')
let dataTable = document.querySelector('#data-table')

let newMaster = []              //holds 'cleaned up', sorted API data from both calls, with national summary as element 0
let rawData = []                //holds copy of downloaded API data
let addlData = []               // holds data from the second api call

let activeState = 0             //index of the default state
let updateTime = moment()

const intlFormat = 'en-US'      //number display format settings
const shwoZeroState = false     //flag whether to show states with zero confirmed cases or not

let url1 = 'https://api.covid19india.org/data.json'                     //National time series, statewise stats and test counts	(NOT Working!!!)
let url2 = 'https://api.covid19india.org/v2/state_district_wise.json'   //State-district-wise V2
// let url3 = 'https://api.covid19india.org/deaths_recoveries.json'        //Deaths and Recoveries

const numFormat = (num) => {
    return Intl.NumberFormat(intlFormat).format(num)
}

const loadMasterData = () => {                          //load masterData from localstorage
    const masterJSON = localStorage.getItem('masterdata')  
    try {
        return masterJSON ? JSON.parse(masterJSON) : []
    } catch (e) {
        return []
    }
}

const getData = async (url) => {
    const response = await fetch(url)
    if (response.status === 200) {
        const data = await response.json()
        return data
    } else {
        throw new Error('Unable to fetch data.. please try later')
    }
}

const sortData = (dArray, key) => {
    if (key === 'name') {
        return dArray.sort ( (a, b) => {
            if (a.name > b.name) {
                return 1
            } else if (a.name < b.name) {
                return -1
            } else {
                return 0
            }
        })
    } else if (key === 'confirmed'){
        return dArray.sort ( (a, b) => {
            if (Number(a.confirmed) > Number(b.confirmed)) {
                return -1
            } else if (Number(a.confirmed) < Number(b.confirmed)) {
                return 1
            } else {
                return 0
            }
        })
    } else if (key === 'deltaconfirmed'){
        return dArray.sort ( (a, b) => {
            if (a.deltaconfirmed > b.deltaconfirmed) {
                return -1
            } else if (a.deltaconfirmed < b.deltaconfirmed) {
                return 1
            } else {
                return 0
            }
        })
    }
    return dArray
}

const cleanupRawData = () => {              //cleanup and save raw-data into masterData array, with a summary item as first element
let natSummary = []

for (let item in addlData.statewise) {

    newMaster.push({
        name: addlData.statewise[item].state,
        confirmed: Number(addlData.statewise[item].confirmed),
        deltaconfirmed: Number(addlData.statewise[item].deltaconfirmed),
        deaths: Number(addlData.statewise[item].deaths),
        deltadeaths: Number(addlData.statewise[item].deltadeaths),
        recovered: Number(addlData.statewise[item].recovered),
        deltarecovered: Number(addlData.statewise[item].deltarecovered),
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

const updateRefreshTime = () => {
    
    if ((moment() - updateTime) > 900000 ) {
        location.reload(true)           //re-load page if time elapsed more than 15 mins
    } else {
        document.querySelector('#update-time').innerHTML = `Last updated: ${updateTime.format("DD MMM HH:mm")} <span class="time-highlight">(${updateTime.fromNow()})</span>`
    }
}

const renderData = (stateIndex, sortBy) => {
    var stateDetails = []
    let dataRow = ''
    let newCases = ''
    let titleLabel = (activeState == 0 ) ? 'State / UT' : 'District / Area'
    
    if (sortBy == 'name') titleLabel = titleLabel + ' ▼'

    if (sortBy !== 'confirmed') document.querySelector('#sortby-total').textContent = 'TOTAL'
    else document.querySelector('#sortby-total').textContent = 'TOTAL' + ' ▼'
    
    if (sortBy !== 'deltaconfirmed') document.querySelector('#sortby-today').textContent = 'TODAY'
    else document.querySelector('#sortby-today').textContent = 'TODAY' + ' ▼'
    
    dataTable.innerHTML = ''
    document.querySelector('#summary-block').scrollTop = 0
    document.querySelector('.table-header-label1').textContent = titleLabel

    stateDetails = [...newMaster[stateIndex].districtData]

    if (sortBy == 'deltaconfirmed') {
        stateDetails = sortData (stateDetails, 'confirmed')      //first sort by confirmed
    }
    stateDetails = sortData (stateDetails, sortBy)              // then by other key

    console.log('stateDetails Array>>', stateDetails)
    
    for (var item in stateDetails) {
        //render data table
        if (stateDetails[item].confirmed == 0 && !shwoZeroState) continue  //eliminate zero case states from display

        newCases = Number(stateDetails[item].deltaconfirmed) ? '+' + numFormat(stateDetails[item].deltaconfirmed) : ''
        dataRow = `<tr class="t-row"><td class="td-sl-no">${Number(item)+1}</td><td class="td-name">${stateDetails[item].name}</td><td class="td-confirmed">${Intl.NumberFormat('en-US').format(stateDetails[item].confirmed)}</td><td class="td-new">${newCases}</td></tr>`
        dataTable.insertAdjacentHTML("beforeend", dataRow)
    } 

    // populate the sate totals element on page
    document.querySelector('#dd-bar-confirmed').textContent = numFormat(newMaster[activeState].confirmed)
    document.querySelector('#dd-bar-today').textContent = `+${numFormat(newMaster[activeState].deltaconfirmed)}`

    document.querySelector('#summary-block-recovered').textContent = numFormat(newMaster[0].recovered)
    document.querySelector('#summary-block-fatality').textContent = numFormat(newMaster[0].deaths)
    document.querySelector('#summary-block-active').textContent = numFormat(newMaster[0].active)
    document.querySelector('#summary-block-delta-recovered').textContent = '+' + numFormat(newMaster[0].deltarecovered)
    document.querySelector('#summary-block-delta-fatality').textContent = '+' + numFormat(newMaster[0].deltadeaths)
    
    document.querySelector('#summary-block-delta-confirmed').textContent = '+' + numFormat(newMaster[0].deltaconfirmed)
    document.querySelector('#summary-block-delta-active').textContent = '+' + numFormat(newMaster[0].deltaactive)

    document.querySelector('#summary-block-confirmed').textContent = numFormat(newMaster[0].confirmed)
    document.querySelector('#summary-block-today').textContent = numFormat(newMaster[0].deltaconfirmed)
    
    updateRefreshTime()
}

const populateDropdown = () => {
    var optionString = ''

    for (var item in newMaster) {
        if (newMaster[item].confirmed == 0 && !shwoZeroState) continue  //eliminate zero case states from dropdown
        if (item == activeState)  
            optionString += `<option value="${item}" selected="true">${newMaster[item].name}</option>`
        else
            optionString += `<option value="${item}" >${newMaster[item].name}</option>`
    } 
    dropdownList.innerHTML = optionString
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

document.querySelector('#table-header-row').addEventListener('click', (e) => {
    // console.log(e.srcElement.textContent)
    let sortkey = ''
    switch(e.srcElement.textContent.toLowerCase())
     {
        case 'total': 
            sortkey = 'confirmed'
            break
        case 'today':
            sortkey = 'deltaconfirmed'
            break
        default:
            sortkey = 'name'
    }
    
    console.log('sorting by: ', sortkey)

    renderData(activeState, sortkey)
})

/* document.querySelector('#sortby-name').addEventListener('click', (e) => {
    console.log(e.currentTarget.innerText)
    renderData(activeState, 'name')
})
 
document.querySelector('#sortby-total').addEventListener('click', (e) => {
    console.log(e.currentTarget.innerText)
    renderData(activeState, 'confirmed')
})

document.querySelector('#sortby-today').addEventListener('click', (e) => {
    console.log(e.currentTarget.innerText)
    renderData(activeState, 'deltaconfirmed')
}) */

/* 
window.onscroll = () => {
    console.log(document.body.scrollTop)
} */

setInterval(updateRefreshTime, 60000)   //update last refresh time every 1 minute
