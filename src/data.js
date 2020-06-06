import {settings, addlData, rawData, masterData } from './index'

const loadMasterData = () => {                          //load masterData from localstorage
    const masterJSON = localStorage.getItem('masterdata')  
    try {
        return masterJSON ? JSON.parse(masterJSON) : []
    } catch (e) {
        return []
    }
}

const cleanupRawData = () => {              //cleanup and save raw-data into masterData array, with a summary item as first element
    let natSummary = []
    
    console.log('Total Tested: ', numFormat(addlData.tested[addlData.tested.length - 1].totalsamplestested))

    for (let item in addlData.statewise) {
    
        masterData.push({
            name: addlData.statewise[item].state,
            confirmed: Number(addlData.statewise[item].confirmed),
            deltaconfirmed: Number(addlData.statewise[item].deltaconfirmed),
            deaths: Number(addlData.statewise[item].deaths),
            deltadeaths: Number(addlData.statewise[item].deltadeaths),
            recovered: Number(addlData.statewise[item].recovered),
            deltarecovered: Number(addlData.statewise[item].deltarecovered),
            active: addlData.statewise[item].confirmed - addlData.statewise[item].recovered - addlData.statewise[item].deaths,
            deltaactive: addlData.statewise[item].deltaconfirmed - addlData.statewise[item].deltarecovered - addlData.statewise[item].deltadeaths,
            totaltested: (item == 0) ? Number(addlData.tested[addlData.tested.length - 1].totalsamplestested) : '',
            testspermillion: (item == 0) ? Number(addlData.tested[addlData.tested.length - 1].testspermillion) : ''
        })
        if (item > 0) {
            natSummary.push({
                name: masterData[item].name,
                confirmed: masterData[item].confirmed,
                deltaconfirmed: masterData[item].deltaconfirmed,
                deaths: masterData[item].deaths,
                deltadeaths: masterData[item].deltadeaths,
                recovered: masterData[item].recovered,
                deltarecovered: masterData[item].deltarecovered,
                active: masterData[item].confirmed -  masterData[item].recovered - masterData[item].deaths
            })    
        }
    }
    
    for (let item in masterData) {           //get district details added to each state 
        let distSummary = []
    
        for (let j in rawData) {
            if (masterData[item].name.toLowerCase() == rawData[j].state.toLowerCase()) {
                //masterData[item].districtData = {...rawData[j].districtData}
                //the above line is a simple one line replacement of the below for loop however, this copies the structure of the rawdata in terms of nested delta numbers within district data this is avoided now.
                
            for (let k in rawData[j].districtData) {
                distSummary.push({
                    name: rawData[j].districtData[k].district,
                    confirmed: rawData[j].districtData[k].confirmed,
                    deltaconfirmed: rawData[j].districtData[k].delta.confirmed,
                    recovered: rawData[j].districtData[k].recovered,
                    deltarecovered: rawData[j].districtData[k].delta.recovered,
                    deaths: rawData[j].districtData[k].deceased,
                    deltadeaths: rawData[j].districtData[k].delta.deceased,
                    active: rawData[j].districtData[k].confirmed - rawData[j].districtData[k].recovered - rawData[j].districtData[k].deceased
                })
                //sort dist summary on 'confirmed'
                sortData(distSummary, 'confirmed')
            }
            masterData[item].districtData = distSummary
            } 
        } 
        if (!masterData[item].districtData) {
            masterData[item].districtData = []
        }
    }
    
    sortData (natSummary , 'confirmed')
    masterData[0].name = "All States"
    masterData[0].districtData = [...natSummary]
    sortData(masterData, 'confirmed')
    console.log('MASTER >>', masterData)
    
    // API data recociliation - for audit purpose only
    let distDeltaConfirmed = 0
    let i = 1       //exclude 'all states' item
    for (i ; i < masterData.length; i++) {
        for (let j in masterData[i].districtData) {
        distDeltaConfirmed += Number(masterData[i].districtData[j].deltaconfirmed)
        }
    }
    console.log(`New Cases > from State data: ${Number(masterData[0].deltaconfirmed)}, from Dist data: ${distDeltaConfirmed}`)
}


const getSettings = () => {
    localStorage.getItem('covidPrefs', settings)
}

const saveSettings = () => {
    console.log(settings)
    localStorage.setItem('covidPrefs', JSON.stringify(settings))
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
    } else if (key === 'active'){
        return dArray.sort ( (a, b) => {
            if (a.active > b.active) {
                return -1
            } else if (a.active < b.active) {
                return 1
            } else {
                return 0
            }
        })
    }
    return dArray
}

const numFormat = (num) => {
    return Intl.NumberFormat(settings.intlFormat).format(num)
}


export {sortData, numFormat, getData, loadMasterData, cleanupRawData }