function parse (str) {
  let value
  try {
    value = JSON.parse(str)
  } catch (err) {
    value = null
  }
  return value
}


function stringify (obj) {
  let value
  try {
    value = JSON.stringify(obj)
  } catch (err) {
    value = null
  }
  return value
}

export default function userLocalStorage () {
  function setItem (key, value) {
    value = stringify(value)
    localStorage.setItem(key ,value)
  }

  function getItem (key) {
    let value = localStorage.getItem(key)
    if (value) {
      value = parse(value)
    }
    return value
  }

  return {
    setItem,
    getItem
  }
}