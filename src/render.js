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
    let statePopulationIndex = 0
    let testsDone = 0 //masterData[stateIndex].totaltested
    let testsPerMillion = 0 //masterData[stateIndex].testspermillion
    let statePopulation = 0

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

    // if(!testInfo.states_tested_data) {  //run only initially, if the test info data is not ready yet
    //     console.log('test stat at initial page load')
    //     document.querySelector('#total-tests').innerHTML = `Total Test Count:<br><span class="test-count">${testsDone > 0 ? numFormat(testsDone) : ''}</span>`
    //     document.querySelector('#tpm').innerHTML = `Tests per Million:<br><span class="tpm">${testsPerMillion > 0 ? numFormat(testsPerMillion) : ''}</span>`
    // }

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

        if(testInfo.states_tested_data) {
            testsDone = 0
            testsPerMillion = 0
            statePopulation = 0
            stateTestsIndex = testInfo.states_tested_data.map(x => x.state.toLowerCase() == masterData[stateIndex].name.toLowerCase()).lastIndexOf(true) - 1        //take tests data from the last-but-one index of the state
            statePopulationIndex = testInfo.states_tested_data.map(x => x.state.toLowerCase() == masterData[stateIndex].name.toLowerCase()).indexOf(true)   //take population from the first listing of the state
            
            statePopulation = (statePopulationIndex < 0) ? 0 : Number(testInfo.states_tested_data[statePopulationIndex].populationncp2019projection)
            
            // console.log('ttl tested at stateIndex in master = ', masterData[item].totaltested)
            if (stateTestsIndex > 0 || stateIndex == 0) {
                testsDone = (stateIndex == 0) ? masterData[stateIndex].totaltested : Number(testInfo.states_tested_data[stateTestsIndex].totaltested) //-1 index to get prev day data. 
                testsPerMillion = (stateIndex == 0) ? masterData[stateIndex].testspermillion : Number(testInfo.states_tested_data[stateTestsIndex].testspermillion)
            }
        } else {
            testsDone = masterData[stateIndex].totaltested
            testsPerMillion = masterData[stateIndex].testspermillion
        }
        
        if(testsPerMillion == '' && stateIndex != 0)
            testsPerMillion = Number(((testsDone / statePopulation) * 1000000).toFixed(0))
        
        console.log('StateIndex: ', stateIndex, ' TestsDone: ', testsDone, ' TPM: ',testsPerMillion, ' Population: ', numFormat(statePopulation))
        document.querySelector('#total-tests').innerHTML = `Total Tests Done<br><span class="test-count">${testsDone > 0 ? numFormat(testsDone) : '-'}</span>`
        document.querySelector('#tpm').innerHTML = `Tests per MM<br><span class="tpm">${testsPerMillion > 0 ? numFormat(testsPerMillion) : '-'}</span>`
        document.querySelector('#recovery-rate').innerHTML = `Recovery Rate<br><span class="tpm">${(masterData[activeState].recovered / masterData[activeState].confirmed * 100).toFixed(1)} %</span>`
        document.querySelector('#fatality-rate').innerHTML = `Fatality Rate<br><span class="tpm">${(masterData[activeState].deaths / masterData[activeState].confirmed * 100).toFixed(2)} %</span>`
        
        
        if (stateDetails[item].confirmed == 0 && !(settings.showZeroState)) continue  //eliminate zero case states from display in table
        
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
    
    // console.log('Population: ', numFormat(statePopulation))
    stateName.textContent = (masterData[activeState].name.length < 20) ? masterData[activeState].name.toUpperCase() : stateName.textContent = masterData[activeState].name.substring(0, 17).toUpperCase() + ' ...'
    
    updateRefreshTime()
}

setInterval(updateRefreshTime, 60000)   //update last refresh time every 1 minute

export { renderData, numFormat }