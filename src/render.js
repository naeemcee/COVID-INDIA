import moment from 'moment'
import { updateTime, masterData, activeState, settings } from './index'
import { numFormat, sortData } from './data'

const dataTable = document.querySelector('#data-table')
const stateName = document.querySelector('#state-name')


const updateRefreshTime = () => {
    
    if (settings.autoUpdate && (moment() - updateTime) > settings.autoUpdate * 60000 )
        location.reload(true)           //re-load page if time elapsed more than 15 mins && autoUpdate is set
    else
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

    stateDetails = [...masterData[stateIndex].districtData]

    if (sortBy == 'deltaconfirmed') {
        stateDetails = sortData (stateDetails, 'confirmed')      //first sort by confirmed
    }
    stateDetails = sortData (stateDetails, sortBy)              // then by other key

    // console.log('stateDetails Array>>', stateDetails)
    
    for (var item in stateDetails) {
        let name = stateDetails[item].name
        // name = (name.length <= 17) ? name : name.substring(0, 17) + ' ...'
        if (stateDetails[item].confirmed == 0 && !(settings.showZeroState)) continue  //eliminate zero case states from display

        if (stateDetails[item].name.toLowerCase() == 'unknown')
        newCases = '<<'
        else
        newCases = Number(stateDetails[item].deltaconfirmed) ? '+' + numFormat(stateDetails[item].deltaconfirmed) : ''
        
        dataRow = `<tr class="t-row"><td class="td-sl-no">${Number(item)+1}</td><td class="td-name">${name}</td><td class="td-confirmed">${Intl.NumberFormat('en-US').format(stateDetails[item].confirmed)}</td><td class="td-new">${newCases}</td></tr>`
        dataTable.insertAdjacentHTML("beforeend", dataRow)
    } 

    // populate the sate totals element on page

    // document.querySelector('#summary-block-title').textContent = masterData[activeState].name.toUpperCase()
    if (masterData[activeState].name.length < 20)
    stateName.textContent = masterData[activeState].name.toUpperCase()
    else
    stateName.textContent = masterData[activeState].name.substring(0, 17).toUpperCase() + ' ...'

    document.querySelector('#summary-block-confirmed').textContent = numFormat(masterData[activeState].confirmed)
    document.querySelector('#summary-block-active').textContent = numFormat(masterData[activeState].active)
    document.querySelector('#summary-block-recovered').textContent = numFormat(masterData[activeState].recovered)
    document.querySelector('#summary-block-fatality').textContent = numFormat(masterData[activeState].deaths)

    document.querySelector('#summary-block-delta-confirmed').textContent = '+' + numFormat(masterData[activeState].deltaconfirmed)
    document.querySelector('#summary-block-delta-active').textContent = ((masterData[activeState].deltaactive >= 0) ?  '+' : '') + numFormat(masterData[activeState].deltaactive)
    document.querySelector('#summary-block-delta-recovered').textContent = '+' + numFormat(masterData[activeState].deltarecovered)
    document.querySelector('#summary-block-delta-fatality').textContent = '+' + numFormat(masterData[activeState].deltadeaths)
    
    updateRefreshTime()
}

setInterval(updateRefreshTime, 60000)   //update last refresh time every 1 minute

export { renderData }