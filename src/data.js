import {settings} from './index'



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

const numFormat = (num) => {
    return Intl.NumberFormat(settings.intlFormat).format(num)
}


export {sortData, numFormat, getData, loadMasterData }