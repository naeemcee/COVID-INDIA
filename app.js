import { someThing } from './render.js'

let dropdownList = document.querySelector('#dd-list')
let dataTable = document.querySelector('#data-table')

let rawData = []                //holds copy of downloaded API data
let masterData = []             //holds 'cleaned up' and sorted API data, including national summary as element 0
let nationalSummary             //holds details of the state selected from dropdown list
let activeState = 0             //index of the default state
let updateTime = moment()
let updateCounter = 0

let url1 = 'https://api.covid19india.org/v2/state_district_wise.json'
let url2 = 'https://api.covid19india.org/deaths_recoveries.json'


const getData = async (url) => {
    const response = await fetch(url)
    if (response.status === 200) {
        const data = await response.json()
        return data
    } else {
        throw new Error('Unable to fetch data.. please try later')
    }
}

getData(url1).then((apiData) => {
    updateTime = moment()

    rawData = {...apiData}                      //clone apiData
    cleanupRawData()                            //cleanup and and save in masterData
    populateDropdown()                          //populate drop down list

    //populate INDIA summary totals
    document.querySelector('#summary-block-confirmed').textContent = Intl.NumberFormat('en-US').format(masterData[0].confirmed)
    document.querySelector('#summary-block-today').textContent = Intl.NumberFormat('en-US').format(masterData[0].newCases)
    document.querySelector('#update-time').textContent = `Last updated: ${updateTime.format("DD MMM HH:mm")} (${updateTime.fromNow()})`
    renderData (activeState, 'confirmed')       //render masterData

    getAdditionalInfo()
    
}).catch((err) => {
    console.log(`Error: ${err}`)
    document.querySelector('#error-area').textContent = `<p class="error">Error (01) aquiring data. Please try again</p>`
})

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
            if (a.confirmed > b.confirmed) {
                return -1
            } else if (a.confirmed < b.confirmed) {
                return 1
            } else {
                return 0
            }
        })
    } else if (key === 'newCases'){
        return dArray.sort ( (a, b) => {
            if (a.newCases > b.newCases) {
                return -1
            } else if (a.neweCases < b.newCases) {
                return 1
            } else {
                return 0
            }
        })
    }
    return dArray
}

const cleanupRawData = () => {                      //cleanup and save raw-data into master-data array, with a summary item as first element
    let nationalConfirmedCases = 0
    let nationalNewCases = 0

    for (var index in rawData) {
        let confirmedCases = 0
        let newCases = 0
        let stateDetails = []
        
        for (var j in rawData[index].districtData) {
            confirmedCases += rawData[index].districtData[j].confirmed
            newCases += rawData[index].districtData[j].delta.confirmed
            
            stateDetails.push ({
                name: rawData[index].districtData[j].district,
                confirmed: rawData[index].districtData[j].confirmed,
                newCases: rawData[index].districtData[j].delta.confirmed
            })
        }

        masterData.push ({
            name: rawData[index].state,
            confirmed: confirmedCases,
            newCases: newCases,
            details: stateDetails
        })                                   
        nationalConfirmedCases += confirmedCases
        nationalNewCases += newCases   
    }
    
    //sort masterData before adding 'all states' as the first element
    sortData(masterData, 'name')
    console.log('Alpha sorted masterData before adding all-states', masterData)
    
    //save the current state of masterData as the nationalSummary and sort based on confirmed cases
    nationalSummary=JSON.parse(JSON.stringify(masterData))
    
    sortData(nationalSummary, 'confirmed')
    console.log('nationalSummary sorted by confirmed cases', nationalSummary)

    //add 'all states' item to masterData array at index 0
    masterData.splice (0,0,{
        name: "All States",
        confirmed: nationalConfirmedCases,
        newCases: nationalNewCases,
        details: nationalSummary
    })

console.log ('alpha sorted masterData with ALL STATES at top', masterData)
}

const updateRefreshTime = () => {
    if (updateCounter < 10) {
        document.querySelector('#update-time').innerHTML = `Last updated: ${updateTime.format("DD MMM HH:mm")} <span class="time-highlight">(${updateTime.fromNow()})</span>`
        updateCounter += 1
    } else {
        updateCounter = 0       //counter is reset as part of page reload.. so not required.
        location.reload(true)
    }
    console.log('time lapsed updated')
}

const renderData = (stateIndex, sortBy) => {
    var stateDetails = []
    let dataRow = ''
    let newCases = ''
    let titleLabel = (activeState == 0 ) ? 'State / UT' : 'District / Area'

    //do something and clear the data table
    dataTable.innerHTML = ''

    document.querySelector('.table-header-label1').textContent = titleLabel
    stateDetails = masterData[stateIndex].details
    if (sortBy == 'newCases') {
        stateDetails = sortData (stateDetails, 'confirmed')      //first sort by confirmed
    }
    stateDetails = sortData (stateDetails, sortBy)              // then by other key

    console.log('stateDetails Array>>', stateDetails)
    
    // table rendered in HTML, so no need of the following lines
    // dataRow = `<tr class="table-header-row"><th class="table-header-col1" colspan="2">${titleLabel}</th><th class="table-header-col2">Total Cases</th><th class="table-header-col3">New Cases</th></tr>`
    // dataTable.innerHTML = dataRow

    for (var item in stateDetails) {
        //render data list
        newCases = stateDetails[item].newCases ? '+' + Intl.NumberFormat('en-US').format(stateDetails[item].newCases) : ''
        dataRow = `<tr class="t-row"><td class="td-sl-no">${Number(item)+1}</td><td class="td-name">${stateDetails[item].name}</td><td class="td-confirmed">${Intl.NumberFormat('en-US').format(stateDetails[item].confirmed)}</td><td class="td-new">${newCases}</td></tr>`
        dataTable.insertAdjacentHTML("beforeend", dataRow)
    } 
    
    // //update refresh time past from now info
    // document.querySelector('#update-time').innerHTML = `Last updated: ${updateTime.format("DD MMM HH:mm")} <span class="time-highlight">(${updateTime.fromNow()})</span>`
    updateRefreshTime()

    // populate the sate totals element on page
    document.querySelector('#dd-bar-confirmed').textContent = Intl.NumberFormat('en-US').format(masterData[activeState].confirmed)
    document.querySelector('#dd-bar-today').textContent = Intl.NumberFormat('en-US').format(masterData[activeState].newCases)    
}

const populateDropdown = () => {
    var optionString = ''

    for (var item in masterData) {
        if (item == activeState)  
            optionString += `<option value="${item}" selected="true">${masterData[item].name}</option>`
        else
            optionString += `<option value="${item}" >${masterData[item].name}</option>`
    } 
    dropdownList.innerHTML = optionString
}

const getAdditionalInfo = () => {                   //call this function to fetch additional info from url2
    getData(url2).then((apiData) => {               //get fatalities and recovery database
    let fatalCases = 0
    let recoveredCases = 0
    let unknownOutcome = 0

    console.log(apiData)
    //cleanup data and retrieve required info. that's something for another day!
    
    //iniitally capturing only overall, national level deaths and recoveries
    for (var item in apiData.deaths_recoveries) {
        if (String(apiData.deaths_recoveries[item].patientstatus).toLowerCase() == 'deceased') {
            fatalCases += 1
        } else if (String(apiData.deaths_recoveries[item].patientstatus).toLowerCase() == 'recovered') {
            recoveredCases += 1
        }
         else {
             unknownOutcome += 1
        }
    }
    document.querySelector('#summary-block-recovered').textContent = Intl.NumberFormat('en-US').format(recoveredCases)
    document.querySelector('#summary-block-fatality').textContent = Intl.NumberFormat('en-US').format(fatalCases)
    document.querySelector('#summary-block-active').textContent = Intl.NumberFormat('en-US').format(masterData[0].confirmed - recoveredCases - fatalCases)
    
    
    console.log(`Recovered: ${recoveredCases}, Fatality: ${fatalCases}, Unknown: ${unknownOutcome}`)

}).catch((err) => {
    console.log(`Error: ${err}`)
    document.querySelector('#error-area').textContent = `<p class="error">Error (02) aquiring data. Please try again</p>`
})

}

dropdownList.addEventListener('change',(e) => {
    console.log(dropdownList.value, masterData[dropdownList.value].name)
    
    activeState = dropdownList.value
    renderData (activeState, 'confirmed')
    
})

//update last refresh time every 1 minute
setInterval(updateRefreshTime, 60000)

console.log (someThing) //troubleshooting import / export

export { masterData }
