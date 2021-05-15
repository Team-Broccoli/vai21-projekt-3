//https://mappingwithd3.com/

d3.json("https://opendata.arcgis.com/datasets/c26bd38e37eb41eab20941cbe5dc6bd5_0.geojson")
    .then(function(data){
        const links = [];
        const metroData = [];

        // https://public-transport-hslhrt.opendata.arcgis.com/datasets/hsln-nousijam%C3%A4%C3%A4r%C3%A4t/data?geometry=23.009%2C59.925%2C26.489%2C60.404&page=7
        // Metrons ID:n 50-66
        
        //Skapar egen array för metro objekt
        for(let i = 49; i<66; i++){
            metroData.push({
                name: data.features[i].properties.Nimi,
                id: data.features[i].properties.OBJECTID,
                volume: data.features[i].properties.Nousijamaa
            });
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
        console.log(metroData)
        
        console.log(links);

        const d = {nodes: metroData, links: links};
        createChart(d)
        
    })

function createChart(data){
    const simulation = d3.forceSimulation(data.nodes)
    //"laddnings" animation, som elektroner/magneter
    .force('charge', d3.forceManyBody().strength(-100))
    //arrow function https://youtu.be/h33Srr5J9nY
    .force('link', d3.forceLink(data.links).id(d => d.id)
    .distance(50))
    .force('center', d3.forceCenter(300, 300))

    const svg = d3.select('body')
        .append('svg')
        .style('background', 'gray')
        //min-x, min-y, height, width
        .attr("viewBox", [0, 0, 600, 600]);

    const link = svg
        .selectAll('path.link')
        .data(data.links)
        .enter()
        .append('path')
            .attr('stroke', 'salmon')
            .attr('stroke-width', 2)
            .attr('fill', 'none');   

    const node = svg.selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
            .attr('r', 2)
            .attr('fill', 'white')
            .attr('stroke', 'blue')
        .on('mouseover', tooltipOp)
        .on('mouseout', tooltipCl)
        .call(d3.drag()
            .on('start', (event, d) => {
                if(!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if(!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            })
        );

    const lineGenerator = d3.line();

    simulation.on('tick', () => {
                    node.attr('cx', d => d.x);
                    node.attr('cy', d => d.y);
                    link.attr('d', d => lineGenerator([
                    [d.source.x, d.source.y], 
                    [d.target.x, d.target.y]]) 
                    )
    });

    const tooltip = d3.select('body').append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)    

    function tooltipOp(event, d){
        tooltip.style('opacity', 1);
        tooltip.html(d.name)
            .style('left', event.pageX-20 + 'px')
            .style('top', event.pageY - 50 + 'px');
    }

    function tooltipCl(event, d){
        tooltip.style('opacity', 0)
    }   

}
        
