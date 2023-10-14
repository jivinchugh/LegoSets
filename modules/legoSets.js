const setData = require("../data/setData"); 
const themeData = require("../data/themeData"); 

//create a variable called "sets", initialized to an empty array
let sets = [];

function initialize()
{
    return new Promise((resolve,reject)=>
    {
    sets=setData.map((set)=>
        {
            const temptheme=themeData.find((theme)=>theme.id === set.theme_id);
            const tempset={...set};
            if(temptheme)
            {
                tempset.theme=temptheme.name;
            }
            return tempset;
        })
        resolve();
    });
};


function getAllSets()
{
    //This function simply returns the complete "sets" array
    return new Promise((resolve,reject)=>
    {
        if(sets)
        {
            resolve(sets);
        }
        else
        {
            reject("not found")
        }
    })
};


function getSetByNum(setNum)
{
    return new Promise((resolve,reject)=>
    {
    // for(const set of sets)
    // {
        
    //     if(set.set_num===setNum)
    //     {
    //         return set; //in true condition
    //     }
    // }
    //return null; //in false condition

    const temp = sets.find(function(set)
    {
        return set.set_num===setNum;
    })

    if(temp)
    {
        resolve(temp);
    }
    else
    {
        reject("unable to find requested set")
    }
  
    });
};




function getSetsByTheme(theme)
{
    return new Promise((resolve,reject)=>
    {
    const lc = theme.toLowerCase();
    const tempx= sets.filter(s_theme=> s_theme.theme.toLowerCase().includes(lc));

    if(tempx.length>0)
    {
        resolve(tempx);
    }
    else{
        reject("unable to find requested setas")
    }

    });
};

initialize();
//console.log(getAllSets());
//console.log(getSetByNum("1000709804-1"))
//console.log(getSetsByTheme("Pirates"))
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme }