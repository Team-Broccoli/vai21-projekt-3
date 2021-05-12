/*d3.csv('./data/fillars-2020-07.csv', (d) => {
    //console.log(d);
})*/
d3.json("https://opendata.arcgis.com/datasets/c26bd38e37eb41eab20941cbe5dc6bd5_0.geojson")
    .then(function(data){
        let width = 500, height = 200;
        let projection = d3.geoEqualEarth();
        projection.fitSize([width, height], data);
        let geoGenerator = d3.geoPath()
            .projection(projection)

        let svg = d3.select('body').append('svg')
            .style('width', width)
            .style('height', height);

        svg.append('g').selectAll('path')
            .data(data.features)
            .join('path')
            .attr('d', geoGenerator)
            .attr('fill', 'red')
            .attr('stroke', 'black');
        
    })
        
