d3.json("./data/hsl_nousijamäärät.geojson")
    .then(function (data) {
        //metro data
        const metroLinks = [];
        const metroData = [];

        //tåg data
        const trainData = [];
        const trainLinks = [];

        // https://public-transport-hslhrt.opendata.arcgis.com/datasets/hsln-nousijam%C3%A4%C3%A4r%C3%A4t/data?geometry=23.009%2C59.925%2C26.489%2C60.404&page=7
        // Metrons ID:n 50-66

        //Skapar egen array för metro objekt
        for (let i = 49; i <= 65; i++) {
            metroData.push({
                name: data.features[i].properties.Nimi,
                id: data.features[i].properties.OBJECTID,
                volume: data.features[i].properties.Nousijamaa,
                lat: data.features[i].geometry.coordinates[0],
                lon: data.features[i].geometry.coordinates[1]
            });
            
            //Om itis station (IK) förgrena mot mellunmäki och puotila
            switch (data.features[i].properties.Lyhyt_tunn) {
                case 'IK':
                    metroLinks.push({
                        source: data.features[i].properties.OBJECTID,
                        target: data.features[i].properties.OBJECTID + 1
                    })

                    metroLinks.push({
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
                    metroLinks.push({
                        source: data.features[i].properties.OBJECTID,
                        target: data.features[i].properties.OBJECTID + 1
                    })
            }
        }

        //tåg data arrays
        for (let i = 0; i <= 44; i++) {
            trainData.push({
                name: data.features[i].properties.Nimi,
                id: data.features[i].properties.OBJECTID,
                volume: data.features[i].properties.Nousijamaa,
                lat: data.features[i].geometry.coordinates[0],
                lon: data.features[i].geometry.coordinates[1]
            });
            for (let j = 0; j < data.features[i].properties.link.length; j++) {
                if (!data.features[i].properties.link[j] == 0) {
                    trainLinks.push({
                        source: data.features[i].properties.OBJECTID,
                        target: data.features[i].properties.link[j]
                    })
                }
            }
        }
        const dT = { nodes: trainData, links: trainLinks };
        const dM = { nodes: metroData, links: metroLinks };

        createMetroChart(dM);

        $('#selection').change(function () {
            d3.selectAll('svg').remove();
            let selection = $('#selection').val();

            switch (selection) {
                case "metro":
                    createMetroChart(dM);
                    break;
                case "rail":
                    createTrainChart(dT);
                    break;
            }
        })
    })

//från lektionsexemplen
function createMetroChart(data) {

    let positioning = 'sim';

    const simulation = d3.forceSimulation(data.nodes)
        .force('charge', d3.forceManyBody().strength(-50))
        .force('link', d3.forceLink(data.links).id(d => d.id)
            .distance(20))
        .force('center', d3.forceCenter(250, 250))

    const svg = d3.select('body')
        .append('svg')
        .style('background', 'gray')
        //min-x, min-y, height, width
        .attr("viewBox", [0, 0, 1000, 600]);

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
        .attr('r', d => d.volume * 0.0005)
        .attr('fill', (d) => {
            //Circelns färg enligt stationens användning
            //console.log(d.volume)
            if (d.volume <= 5000) {
                return 'green';
            }
            if (d.volume <= 10000) {
                return 'yellow';
            }
            if (d.volume <= 20000) {
                return 'orange';
            }
            if (d.volume <= 30000 || d.volume < 30000) {
                return 'red';
            }
        })
        .attr('stroke', 'black')
        .on('mouseover', tooltipOp)
        .on('mouseout', tooltipCl)
        .call(d3.drag()
            .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                if (positioning === 'map') {
                    d.fx = d.x;
                    d.fy = d.y
                } else {
                    d.fx = null;
                    d.fy = null;
                }
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

    function tooltipOp(event, d) {
        tooltip.style('opacity', 1);
        tooltip.html(d.name + ".<br> Nousijamäärä: " + d.volume)
            .style('left', event.pageX - 20 + 'px')
            .style('top', event.pageY - 50 + 'px');

    }

    function tooltipCl(event, d) {
        tooltip.style('opacity', 0)
    }

    d3.select('#toggle').on('click', toggleMetro)

    function toggleMetro() {
        if (positioning === 'map') {
            positioning = 'sim'

            data.nodes.forEach(function (d) {
                d.x = d.fx;
                d.y = d.fy;
                d.fx = null;
                d.fy = null;
            })
            simulation.alphaTarget(0.3).restart();
        } else {
            positioning = 'map';
            data.nodes.forEach(function (d) {
                let projection = d3.geoEqualEarth()
                    .center([25.09000, 60.20921])
                    .translate([500, 300])
                    .scale([1000 * 200])

                let pos = projection([d.lat, d.lon])
                d.fx = pos[0];
                d.fy = pos[1];
            })
        }

    }
}
function createTrainChart(data) {

    let positioning = 'sim';

    const simulation = d3.forceSimulation(data.nodes)
        .force('charge', d3.forceManyBody().strength(-20))
        .force('link', d3.forceLink(data.links).id(d => d.id)
            .distance(5))
        .force('center', d3.forceCenter(500, 300))

    const svg = d3.select('body')
        .append('svg')
        .style('background', 'gray')
        //min-x, min-y, height, width
        .attr("viewBox", [0, 0, 1000, 600]);

    const link = svg
        .selectAll('path.link')
        .data(data.links)
        .enter()
        .append('path')
        .attr('stroke', 'purple')
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    const node = svg.selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', (d) => {
            //någorlunda vettig skala
            //fritt fram o leka fram bättre :D
            if (d.volume < 500) {
                return d.volume * 0.01;
            }
            else if (d.volume < 1000) {
                return d.volume * 0.003;
            }
            else if (d.volume < 2000) {
                return d.volume * 0.002;
            }
            else if (d.volume < 5000) {
                return d.volume * 0.001;
            }
            else if (d.volume < 10000) {
                return d.volume * 0.0008;
            }
            else if (d.volume < 15000) {
                return d.volume * 0.0009;
            }
            else if (d.volume < 20000) {
                return d.volume * 0.0009;
            }
            else {
                return d.volume * 0.0003;
            }



        })
        .attr('fill', (d) => {
            //Circelns färg enligt stationens användning
            //console.log(d.volume)
            if (d.volume <= 5000) {
                return 'green';
            }
            if (d.volume <= 10000) {
                return 'yellow';
            }
            if (d.volume <= 20000) {
                return 'orange';
            }
            if (d.volume <= 30000 || d.volume > 30000) {
                return 'red';
            }
        })
        .attr('stroke', 'black')
        .on('mouseover', tooltipOp)
        .on('mouseout', tooltipCl)
        .call(d3.drag()
            .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                if (positioning === 'map') {
                    d.fx = d.x;
                    d.fy = d.y
                } else {
                    d.fx = null;
                    d.fy = null;
                }
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

    function tooltipOp(event, d) {
        tooltip.style('opacity', 1);
        tooltip.html(d.name + ".<br> Nousijamäärä: " + d.volume)
            .style('left', event.pageX - 20 + 'px')
            .style('top', event.pageY - 50 + 'px');

    }

    function tooltipCl(event, d) {
        tooltip.style('opacity', 0)
    }

    d3.select('#toggle').on('click', toggle)

    function toggle() {
        if (positioning === 'map') {
            positioning = 'sim'

            data.nodes.forEach(function (d) {
                d.x = d.fx;
                d.y = d.fy;
                d.fx = null;
                d.fy = null;

            })
            simulation.alphaTarget(0.3).restart();
        } else {
            positioning = 'map'
            data.nodes.forEach(function (d) {
                let projection = d3.geoEqualEarth()
                    .center([24.70000, 60.21921])
                    .translate([500, 300])
                    .scale([1000 * 90])

                let pos = projection([d.lat, d.lon])
                d.fx = pos[0];
                d.fy = pos[1];
            })
        }
    }
}
