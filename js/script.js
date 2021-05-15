//https://mappingwithd3.com/

d3.json("https://opendata.arcgis.com/datasets/c26bd38e37eb41eab20941cbe5dc6bd5_0.geojson")
    .then(function(data){
        const links = [];
        const metroData = [];

        // https://public-transport-hslhrt.opendata.arcgis.com/datasets/hsln-nousijam%C3%A4%C3%A4r%C3%A4t/data?geometry=23.009%2C59.925%2C26.489%2C60.404&page=7
        // Metrons ID:n 50-66
        
        //Skapar egen array för metro objekt
        for(let i = 49; i<66; i++){
            for(let j = 0; j<17; j++){
                metroData[j] = data.features[i];
            }
            //Om itis station (IK) förgrena mot mellunmäki och puotila
            switch(data.features[i].properties.Lyhyt_tunn) {
                case 'IK':
                    links.push({
                        source: data.features[i].properties.OBJECTID,
                        target: data.features[i].properties.OBJECTID + 1
                    })

                    links.push({
                        source: data.features[i].properties.OBJECTID,
                        target: 64
                    })
                    break;
                //Mellunmäki, fortsätt inte
                case 'MM':
                    break;
                //Vuosaari, fortsätt inte
                case 'VS':
                    break;

                default:
                    links.push({
                        source: data.features[i].properties.OBJECTID,
                        target: data.features[i].properties.OBJECTID + 1
                    })
            }
        }
        console.log(metroData[0])
        console.log(links);
        
    })

function createChart(data){
   

}
        
