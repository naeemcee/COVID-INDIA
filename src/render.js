import moment from 'moment'
import { updateTime, masterData, activeState, zoneInfo, testInfo, settings } from './index'
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
    let stateTestsIndex = 0
    let stateTestsDone = 0
    let testPerMillion = 0

    dataTable.innerHTML = ''
    // document.querySelector('.sticky-wrapper').scrollTop = '5px'
    // console.log(document.querySelector('#data-table').scrollTop)

    document.querySelector('#summary-block-confirmed').textContent = numFormat(masterData[activeState].confirmed)
    document.querySelector('#summary-block-active').textContent = numFormat(masterData[activeState].active)
    document.querySelector('#summary-block-recovered').textContent = numFormat(masterData[activeState].recovered)
    document.querySelector('#summary-block-fatality').textContent = numFormat(masterData[activeState].deaths)

    document.querySelector('#summary-block-delta-confirmed').textContent = '+' + numFormat(masterData[activeState].deltaconfirmed)
    document.querySelector('#summary-block-delta-active').textContent = ((masterData[activeState].deltaactive >= 0) ?  '+' : '') + numFormat(masterData[activeState].deltaactive)
    document.querySelector('#summary-block-delta-recovered').textContent = '+' + numFormat(masterData[activeState].deltarecovered)
    document.querySelector('#summary-block-delta-fatality').textContent = '+' + numFormat(masterData[activeState].deltadeaths)

    document.querySelector('.table-header-label1').textContent = (sortBy == 'name') ? titleLabel + ' ▼' : titleLabel
    document.querySelector('.table-header-label2').textContent = (sortBy == 'confirmed') ? 'TOTAL' + '▼' : 'TOTAL'
    document.querySelector('.table-header-label3').textContent = (sortBy == 'deltaconfirmed') ? 'TODAY' + '▼' : 'TODAY'
    document.querySelector('.table-header-label4').textContent = (sortBy == 'active') ? 'ACTIVE' + '▼' : 'ACTIVE'

    document.querySelector('#total-tests').innerHTML = `Total Test Count: <span class="test-count">${masterData[stateIndex].totaltested > 0 ? numFormat(masterData[stateIndex].totaltested) : ''}</span>`

    stateDetails = [...masterData[stateIndex].districtData]
    
    if (sortBy == 'deltaconfirmed') {
        stateDetails = sortData (stateDetails, 'confirmed')      //first sort by confirmed
    }
    stateDetails = sortData (stateDetails, sortBy)              // then by other key

    // console.log('stateDetails Array>>', stateDetails)
    // console.log('Tests Info:', testInfo)

    for (var item in stateDetails) {
        let zone = ''
        let zoneIndex = 0
        let active = 0
        let name = stateDetails[item].name

        if(testInfo.states_tested_data && stateIndex !=0) {
            stateTestsIndex = testInfo.states_tested_data.map(x => x.state.toLowerCase() == masterData[stateIndex].name.toLowerCase()).lastIndexOf(true)            
            
            if(stateTestsIndex > 0) {
                stateTestsDone = Number(testInfo.states_tested_data[stateTestsIndex].totaltested)
                testPerMillion = Number(testInfo.states_tested_data[stateTestsIndex].testspermillion)

            }
            // stateTestsDone = (stateTestsIndex > 0) ? Number(testInfo.states_tested_data[stateTestsIndex].totaltested) : 0
            document.querySelector('#total-tests').innerHTML = `Total Test Count: <span class="test-count">${stateTestsDone > 0 ? numFormat(stateTestsDone) : 'n/a'}</span>`
                                                                //  [ Tests Per MM: <span class="tpm">${numFormat(testPerMillion)}</span> ]
        }

        if (stateDetails[item].confirmed == 0 && !(settings.showZeroState)) continue  //eliminate zero case states from display

        // if (stateDetails[item].name.toLowerCase() == 'unknown') newCases = '<<'
        // else 
        newCases = Number(stateDetails[item].deltaconfirmed) ? '+ ' + numFormat(stateDetails[item].deltaconfirmed) : ''
        
        if(zoneInfo.zones && stateIndex !== 0) {
            zoneIndex = zoneInfo.zones.findIndex(x => x.district.toLowerCase() == name.toLowerCase())
            zone = zoneIndex > 0 ? zoneInfo.zones[zoneIndex].zone : 'Unknown'
        }
        active = (stateDetails[item].confirmed - stateDetails[item].deaths - stateDetails[item].recovered)
        active = active == 0 ? '-' : numFormat(active)

        dataRow =  `<tr class="t-row">
                    <td class="td-sl-no">${Number(item)+1}</td>
                    <td class="td-name"><span class="${zone}"></span>${name}</td>
                    <td class="td-confirmed">${numFormat(stateDetails[item].confirmed)}</td>
                    <td class="td-new">${newCases}</td>
                    <td class="td-active">${active}</td>
                    </tr>`
        dataTable.insertAdjacentHTML("beforeend", dataRow)
    } 

    // populate the sate totals element on page

    // document.querySelector('#summary-block-title').textContent = masterData[activeState].name.toUpperCase()
    
    stateName.textContent = (masterData[activeState].name.length < 20) ? masterData[activeState].name.toUpperCase() : stateName.textContent = masterData[activeState].name.substring(0, 17).toUpperCase() + ' ...'
    
    // if (masterData[activeState].name.length < 20)
    // stateName.textContent = masterData[activeState].name.toUpperCase()
    // else
    // stateName.textContent = masterData[activeState].name.substring(0, 17).toUpperCase() + ' ...'
    
    updateRefreshTime()
}

setInterval(updateRefreshTime, 60000)   //update last refresh time every 1 minute

export { renderData, numFormat }