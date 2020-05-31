var stateName = ''
const dataEl = document.querySelector ('#data-area')
var keralaData = []
let sortedData = []


let url = 'https://api.covid19india.org/v2/state_district_wise.json'


const getCovid = async (url) => {
    const response = await fetch(url)
    if (response.status === 200) {
        const data = await response.json()
        return data
    } else {
        throw new Error('Unable to fetch prayer time.. please try later')
    }
}

const sortCovid = (sortBy) => {

    if (sortBy === 'byCount') {
        return keralaData.sort ( (a, b) => {
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

const renderCovid = (cData) => {
    console.log (cData)
    
    dataEl.innerHTML = ''
    const headEl = document.createElement('h2')
    headEl.classList.add('list-head')
    headEl.textContent = `${stateName} (as at ${moment().format("hh:mm a, DD MMM YYYY")})`
    dataEl.appendChild (headEl)
    var lineHtml = ''
    let slNo = 1
    let totalCases = 0, totalNew = 0


    for (var item in cData) {
        let newCases = cData[item].new
        const lineEl = document.createElement('div')
        lineEl.classList.add('list-item')
        dataEl.appendChild (lineEl)

        totalCases += cData[item].confirmed
        if (newCases) {
            totalNew += cData[item].new
            console.log(totalNew)
            lineHtml = `<div class="sl-no">${slNo}</div><div class="dist">. ${cData[item].district}</div><div class="count">${cData[item].confirmed}</div><div class="new">+${newCases}</div>`
        }
        else
            lineHtml = `<div class="sl-no">${slNo}</div><div class="dist">. ${cData[item].district}</div><div class="count">${cData[item].confirmed}</div><div class="new"></div>`

    lineEl.innerHTML = lineHtml
    slNo += 1

    }
    //display total count
    lineEl = document.createElement('div')
    lineEl.classList.add('total-item')
    dataEl.appendChild (lineEl)
    console.log(totalNew)
    lineEl.innerHTML = `<div class="sl-no"></div><div class="dist">TOTAL CASES</div><div class="count">${totalCases}</div><div class="new"> (${totalNew} today)</div>`
    // lineEl.innerHTML = `Total Cases: ${totalCases}`
}

getCovid(url).then((covidData) => {
    // console.log(covidData[0])                                    //first element [0] is Kerala data 
    stateName = covidData[0].state
    console.log(stateName)

    for (var item in covidData[0].districtData) {
        // console.log(`${covidData[0].districtData[item].district}: ${covidData[0].districtData[item].confirmed}`)
        
        keralaData.push({                                           //get required information to the local array
            district: covidData[0].districtData[item].district,     //get district name
            confirmed: covidData[0].districtData[item].confirmed,   //get total confirmed cases
            new: covidData[0].districtData[item].delta.confirmed    //get the new cases today figures
        })
    }
    // call function to sort data based on 'byAlpha', or byCount'
    sortCovid ('byCount')
    // console.log(sortedData)
    renderCovid (keralaData)

}).catch((err) => {
    console.log(`Error: ${err}`)
})
