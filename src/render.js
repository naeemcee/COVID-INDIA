import moment from 'moment'
import { updateTime, newMaster, activeState, settings } from './index'
import { numFormat, sortData } from './data'

let dataTable = document.querySelector('#data-table')
let dropdownList = document.querySelector('#dd-list')
let stateName = document.querySelector('#state-name')

const populateDropdown = () => {
    var optionString = ''
    return
    for (var item in newMaster) {
        if (newMaster[item].confirmed == 0 && !(settings.showZeroState)) continue  //eliminate zero case states from dropdown
        if (item == activeState)  
            optionString += `<option value="${item}" selected="true">${newMaster[item].name}</option>`
        else
            optionString += `<option value="${item}" >${newMaster[item].name}</option>`
    } 
    dropdownList.innerHTML = optionString
}

const updateRefreshTime = () => {
    
    if (settings.autoUpdate && (moment() - updateTime) > settings.autoUpdate * 60000 )
        location.reload(true)           //re-load page if time elapsed more than 15 mins && autoUpdate is set
    else
        // document.querySelector('#update-time').innerHTML = `Last updated:<br>${updateTime.format("DD MMM HH:mm")} <span class="time-highlight">(${updateTime.fromNow()})</span>`
        document.querySelector('#update-time').innerHTML = `Last updated: ${updateTime.format("DD MMM HH:mm")} (<span class="time-highlight">${updateTime.fromNow()})</span>`
}

const renderData = (stateIndex, sortBy) => {
    var stateDetails = []
    let dataRow = ''
    let newCases = ''
    let titleLabel = (activeState == 0 ) ? 'State / UT' : 'District / Area'

    dataTable.innerHTML = ''

    document.querySelector('.table-header-label1').textContent = (sortBy == 'name') ? titleLabel + ' ▼' : titleLabel
    document.querySelector('.table-header-label2').textContent = (sortBy == 'confirmed') ? 'TOTAL' + '▼' : 'TOTAL'
    document.querySelector('.table-header-label3').textContent = (sortBy == 'deltaconfirmed') ? 'TODAY' + '▼' : 'TODAY'

    stateDetails = [...newMaster[stateIndex].districtData]

    if (sortBy == 'deltaconfirmed') {
        stateDetails = sortData (stateDetails, 'confirmed')      //first sort by confirmed
    }
    stateDetails = sortData (stateDetails, sortBy)              // then by other key

    console.log('stateDetails Array>>', stateDetails)
    
    for (var item in stateDetails) {
        if (stateDetails[item].confirmed == 0 && !(settings.showZeroState)) continue  //eliminate zero case states from display

        if (stateDetails[item].name.toLowerCase() == 'unknown')
        newCases = '<<'
        else
        newCases = Number(stateDetails[item].deltaconfirmed) ? '+' + numFormat(stateDetails[item].deltaconfirmed) : ''
        
        dataRow = `<tr class="t-row"><td class="td-sl-no">${Number(item)+1}</td><td class="td-name">${stateDetails[item].name}</td><td class="td-confirmed">${Intl.NumberFormat('en-US').format(stateDetails[item].confirmed)}</td><td class="td-new">${newCases}</td></tr>`
        dataTable.insertAdjacentHTML("beforeend", dataRow)
    } 

    // populate the sate totals element on page

    // document.querySelector('#summary-block-title').textContent = newMaster[activeState].name.toUpperCase()
    stateName.textContent = newMaster[activeState].name.toUpperCase()

    document.querySelector('#summary-block-confirmed').textContent = numFormat(newMaster[activeState].confirmed)
    document.querySelector('#summary-block-active').textContent = numFormat(newMaster[activeState].active)
    document.querySelector('#summary-block-recovered').textContent = numFormat(newMaster[activeState].recovered)
    document.querySelector('#summary-block-fatality').textContent = numFormat(newMaster[activeState].deaths)

    document.querySelector('#summary-block-delta-confirmed').textContent = '+' + numFormat(newMaster[activeState].deltaconfirmed)
    document.querySelector('#summary-block-delta-active').textContent = ((newMaster[activeState].deltaactive >= 0) ?  '+' : '') + numFormat(newMaster[activeState].deltaactive)
    document.querySelector('#summary-block-delta-recovered').textContent = '+' + numFormat(newMaster[activeState].deltarecovered)
    document.querySelector('#summary-block-delta-fatality').textContent = '+' + numFormat(newMaster[activeState].deltadeaths)
    
    updateRefreshTime()
}

setInterval(updateRefreshTime, 60000)   //update last refresh time every 1 minute

export { renderData, populateDropdown, dropdownList, stateName }