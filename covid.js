const dataEl = document.querySelector ('#data-area')
const ddList = document.querySelector('#dd-state-names')

var stateName = ''
var optionElement = ''

var stateData = []
var nationalData = []
var chosenState = 0
var nationalConfirmedCases = 0
var nationalNewCases = 0
var masterData = []

let url = 'https://api.covid19india.org/v2/state_district_wise.json'


const getCovid = async (url) => {
    const response = await fetch(url)
    if (response.status === 200) {
        const data = await response.json()
        return data
    } else {
        throw new Error('Unable to fetct data.. please try later')
    }
}

const sortCovid = (sortBy) => {

    if (sortBy === 'byCount') {
        return stateData.sort ( (a, b) => {
            if (a.confirmed > b.confirmed) {
                return -1
            } else if (a.confirmed < b.confirmed) {
                return 1
            } else {
                return 0
            }
        })
    }
}

const sortMasterData = (cData) => {
    
    for (index in cData) {
        return cData[index].sort ( (a, b) => {
            if (String(a.state).toLowerCase() > String(b.state).toLowerCase()) {
                return 1
            } else if (String(a.state).toLowerCase() < String(b.state).toLowerCase()) {
                return -1
            } else {
                return 0
            }
        })
    }
}

const extractNationalSummary = (cData) => {
    
    for (var key in cData) {
        var stateName = cData[key].state
        let confirmedCases = 0
        let newCases = 0
        
        for (var i in cData[key].districtData) {
            confirmedCases += cData[key].districtData[i].confirmed
            newCases += cData[key].districtData[i].delta.confirmed
        }
        nationalData.push({
            state: stateName,
            confirmed: confirmedCases,
            newCases: newCases
        })
        nationalConfirmedCases += confirmedCases
        nationalNewCases += newCases
    }

    //sort nationalSummary object alphabetically

        return nationalData.sort ( (a, b) => {
            if (a.state > b.state) {
                return 1
            } else if (a.state < b.state) {
                return -1
            } else {
                return 0
            }
        })

}


const populateDropdown = () => {
    
    //extract list of state names from masterData and populate the dropdown list
    // optionElement += `<option value="india">INDIA</option>`


    for (var item in nationalData) {
        if (String(nationalData[item].state).toLowerCase() == String(masterData[chosenState].state).toLowerCase()) {
            optionElement += `<option value="${String(nationalData[item].state).toLowerCase()}" selected="true">${nationalData[item].state}</option>`
        } else {
            optionElement += `<option value="${String(nationalData[item].state).toLowerCase()}">${nationalData[item].state}</option>`
        }
    }
    ddList.innerHTML = optionElement
}

const renderCovid = (infoArray) => {
    
    var lineHtml = ''
    let slNo = 1
    let totalCases = 0, totalNew = 0

    for (var item in masterData[chosenState].districtData) {
        
        stateData.push({                                                       //get required information to the local array
            district: masterData[chosenState].districtData[item].district,     //get district name
            confirmed: masterData[chosenState].districtData[item].confirmed,   //get total confirmed cases
            newCases: masterData[chosenState].districtData[item].delta.confirmed    //get the new cases today figures
        })
    }

    sortCovid ('byCount')

    // stateName = masterData[chosenState].state
    // console.log('default state:',stateName)
    // document.querySelector('#state-name').textContent = stateName


    for (var item in stateData) {
        let newCases = stateData[item].newCases
        const lineEl = document.createElement('div')
        lineEl.classList.add('list-item')
        dataEl.appendChild (lineEl)

        totalCases += stateData[item].confirmed
        if (newCases) {
            totalNew += stateData[item].newCases
            // console.log(totalNew)
            lineHtml = `<div class="sl-no">${slNo} </div><div class="dist">. ${stateData[item].district}</div><div class="count">${Intl.NumberFormat('en-US').format(stateData[item].confirmed)}</div><div class="new">+${newCases}</div>`
        }
        else
            lineHtml = `<div class="sl-no">${slNo} </div><div class="dist">. ${stateData[item].district}</div><div class="count">${Intl.NumberFormat('en-US').format(stateData[item].confirmed)}</div><div class="new"></div>`

    lineEl.innerHTML = lineHtml
    slNo += 1

    }
    // update summary total cases and new cases on the head-row
    console.log(stateData)
    document.querySelector('#total-cases').textContent = new Intl.NumberFormat('en-US').format(totalCases)
    document.querySelector('#new-cases').textContent = totalNew

    document.querySelector('#india-cases').innerHTML = Intl.NumberFormat('en-US').format(nationalConfirmedCases)
    document.querySelector('#india-new').innerHTML = Intl.NumberFormat('en-US').format(nationalNewCases)
    
}

getCovid(url).then((apiData) => {
    // console.log('covidData:', apiData)

    //make a copy of the API data to the variable masterData for later use
    masterData = Object.assign({}, apiData);                //clone API returned object to global object, masterData
    // masterData=JSON.parse(JSON.stringify(covidData))     //alternate cloning method
    // masterData = covidData                               //cloning Doesn't work this way >>seems to be working now!!
           
    console.log(masterData)
    // sortMasterData(masterData)
    extractNationalSummary(masterData)
    console.log(nationalData)
    console.log(`National Cases: ${nationalConfirmedCases} | National New Cases: ${nationalNewCases}`)

    //push national summary as the first element of masterData
    // masterData.splice(0,1,nationalSummary)

    // populateDropdown(masterData)
    populateDropdown()

    renderCovid (nationalData)  //!!!modify to ensure nationalData obj is used for render

}).catch((err) => {
    console.log(`Error: ${err}`)
    document.querySelector('#data-area').textContent = `Oops.. something went wrong... please try again later`
})


ddList.addEventListener('change',(e) => {
    for (var item in masterData) {
        if (String(masterData[item].state).toLowerCase() === String(ddList.value).toLowerCase()) {
            chosenState = item
            break
        }
    }
    console.log('chosen state:', ddList.value, chosenState)

    stateName = masterData[chosenState].state
    // document.querySelector('#state-name').textContent = String(ddList.value).toUpperCase()

    dataEl.innerHTML = ''
    stateData = []
    renderCovid (stateData)     //!!!modify to ensure stateData obj is used for render
    // console.log(masterData)
    
})
