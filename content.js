var domain = window.location.hostname;
var urlList = [];
chrome.storage.local.get(null, function(items)
    {
        urlList = Object.keys(items);
    }
);
let inputFields = document.getElementsByTagName("input");
let buttons = document.getElementsByTagName("*");
function addPassword()
{
    let done = false;
    for(let i = 0; i < inputFields.length; i++)
    {
        if(inputFields[i].type === "password")
        {
            for(let j=0; j < buttons.length; j++)
            {
                if(buttons[j].type === "submit" || buttons[j].className === "submit")
                {
                    buttons[j].addEventListener("click", async function()
                    {
                        await synchronize();
                        if(inputFields[i].value.length !== 0)
                        {
                            for(let k = 0; k < urlList.length; k++)
                            {
                                if(domain.indexOf(urlList[k]) === -1 || urlList[k].indexOf(domain) === -1 && !done)
                                {
                                    chrome.storage.local.get(urlList[k], function(element)
                                    {
                                        if (element[urlList[k]] == inputFields[i].value)
                                        {
                                            var popUp = confirm("WARNING: You are using this password for "+urlList[k]+". It is safer to have a unique password for each website you visit. Click ok to continue or cancel to re-enter your password");
                                            if(popUp == true)
                                            {
                                                chrome.storage.local.set({[domain]: [inputFields[i].value]});
                                            }
                                            else
                                            {
                                                location.reload(true);
                                            }
                                            done = true;
                                        }
                                        else
                                        {
                                            let levenshteinDistance = findLevenshteinDistance(element[urlList[k]].toString(), inputFields[i].value);
                                            let longerPassword = Math.max(element[urlList[k]].toString().length, inputFields[i].value.length);
                                            let percentageDifference = 100*((longerPassword-levenshteinDistance)/longerPassword);
                                            if(percentageDifference >= 60 && percentageDifference !== 100)
                                            {
                                                var popUp2 = confirm("WARNING: The password you have entered is "+Math.round(percentageDifference)+"% similar to "+urlList[k]+". It is safer to have a unique password for each website you visit. Click ok to continue or cancel to re-enter your password");
                                                if(popUp2 == true)
                                                {
                                                    chrome.storage.local.set({[domain]: [inputFields[i].value]});
                                                }
                                                else
                                                {
                                                    location.reload(true);
                                                }
                                                done = true;
                                            }
                                            else
                                            {
                                                chrome.storage.local.set({[domain]: [inputFields[i].value]});
                                            }
                                        }
                                    });
                                }
                            }
                            chrome.storage.local.set({[domain]: [inputFields[i].value]});
                        }
                    });
                }
            }
        }
    }
}

function synchronize()
{
    chrome.storage.local.get(null, function(items)
        {
            urlList = Object.keys(items);
            return "";
        }
    );
}

function findLevenshteinDistance(newPassword, oldPassword)
{
    let levenshteinMatrix = [];
    let previousRow = [];
    let currentRow = [];
    for(let i = 0; i < oldPassword.length+1; i++)
    {
        currentRow[i] = i
    }
    for(let i = 1; i < newPassword.length+1; i++)
    {
        previousRow = currentRow;
        currentRow = [];
        for(let j = 0; j < oldPassword.length+1; j++)
        {
            if(j === 0)
            {
                currentRow[j] = i
            }
            else
            {
                let d1 = previousRow[j-1];
                let d2 = currentRow[j-1];
                let d3 = previousRow[j];
                if(newPassword[i-1] === oldPassword[j-1] && oldPassword[j-1] != undefined)
                {
                    let smallestDistance = Math.min(d1, d2);
                    smallestDistance = Math.min(smallestDistance, d3);
                    currentRow[j] = smallestDistance;
                }
                else
                {
                    let smallestDistance = Math.min(d1, d2);
                    smallestDistance = Math.min(smallestDistance, d3);
                    currentRow[j] = smallestDistance+1;
                }
            }
        }
    }
    let levenshteinDistance = currentRow[oldPassword.length];
    return levenshteinDistance;
}

addPassword();