// api from: https://carbonintensity.org.uk

const apiEnergy = 'https://api.carbonintensity.org.uk/regional/regionid/13'
const conversionfactors = 'conversionfactors.csv'

let margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
}
const width = 1000 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom
let delay = 1000


d3.csv(conversionfactors)
    .then(data => {
        let factorsData = d3.groups(data, d => d.level1)
        factorTable(factorsData)
    });


d3.json(apiEnergy)
    .then(data => buildDoughnutChart(data.data[0].data[0]))



function buildDoughnutChart(data) {

    let colours = d3.scaleSequential()
        .domain([0, data.generationmix.length])
        .interpolator(d3.interpolateRainbow)

    let arc = d3.arc()
        .innerRadius(0.5 * height / 2)
        .outerRadius(0.8 * height / 2)

    let labelArcs = d3.arc()
        .innerRadius(0.9 * height / 2)
        .outerRadius(0.95 * height / 2)

    // here is the data organised to build the pie chart
    let pie = d3.pie()
        .value(d => d.perc)
    let pieArcs = pie(data.generationmix)

    let svgContainer = d3.select('#pie-london-container')
        .append('svg')
        .attr('class', 'charts')
        .attr('id', `pie-london`)

    let svg = svgContainer.attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .classed('svg-content-responsive', true)

    svg.append('g')
        .attr('class', 'doughnut-container')
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll('path')
        .data(pieArcs)
        .join('path')
        .style('stroke', d => colours(d.index))
        .style('stroke-width', 2)
        .style('fill', d => colours(d.index))
        .transition()
        .ease(d3.easeBounce)
        .duration(delay)
        .attrTween('d', function (d) {
            let i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return arc(d);
            }
        })

    let text = svg.append('g')
        .attr('class', 'labels-container')
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll('text')
        .data(pieArcs)
        .join('text')
        .attr('transform', d => `translate(${labelArcs.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('fill', d => colours(d.index))

    text.selectAll('tspan')
        .data(d => (d.data.perc !== 0) ? [
            d.data.fuel,
            d.data.perc.toFixed(1) + '  %'
        ] : ['', ''])
        .join('tspan')
        .attr('x', 0)
        .attr('class', 'pie-labels')
        .style('font-weight', (d, i) => i ? undefined : 'bold')
        .attr('dy', 0)
        .text(d => d)
        .style('opacity', 0)
        .transition()
        .delay(delay * 1.2)
        .attr('dy', (d, i) => i ? '1.2em' : 0)
        .style('opacity', 1)

    svg.append("text")
        .attr('transform', `translate(${ width / 2 },${1.2 * height / 2 })`)
        .attr("text-anchor", "middle")
        .attr('class', 'pie-centre-title')
        .text(`${data.intensity.index}`)
        .style('opacity', 0)
        .transition()
        .delay(delay)
        .attr('transform', `translate(${ width / 2 },${1.03* height / 2 })`)
        .style('opacity', 1)

    svg.append("text")
        .attr('transform', `translate(${ width / 2 },${1.3 * height / 2 })`)
        .attr("text-anchor", "middle")
        .attr('class', 'pie-centre')
        .text(`${data.intensity.forecast} gCO2/KWh`)
        .style('opacity', 0)
        .transition()
        .delay(delay)
        .attr('transform', `translate(${ width / 2 },${1.15*height / 2 })`)
        .style('opacity', 1)

    svg.append("text")
        .attr('transform', `translate(${ width / 2 },${1.1* height / 2 })`)
        .attr("text-anchor", "middle")
        .attr('class', 'pie-centre-lower')
        .text(`London's carbon intensity level is`)
        .style('opacity', 0)
        .transition()
        .delay(delay)
        .attr('transform', `translate(${ width / 2 },${0.86 * height / 2 })`)
        .style('opacity', 1)
}

function factorTable(factorsData) {

    console.log(factorsData)
    factorsData.forEach(item => {

        let selector = document.querySelector('#factor-table')

        let listItem = document.createElement('div')
        listItem.setAttribute('class', 'list-item')
        selector.appendChild(listItem)

        let listFactor = document.createElement('div')
        listFactor.setAttribute('class', 'list-factor')
        listItem.appendChild(listFactor)

        let titleFactor = document.createElement('h3')
        titleFactor.innerHTML = item[0]
        listFactor.appendChild(titleFactor)

        let listAssetsDiv = document.createElement('div')
        listAssetsDiv.setAttribute('class', 'list-assets')
        listItem.appendChild(listAssetsDiv)

        item[1].forEach((sub, i) => {
            let subListClass = 'sub-list-assets'

            if (i % 2 == 0) {
                subListClass = 'sub-list-assets-odd'
            }

            let sublist = document.createElement('div')
            sublist.setAttribute('class', subListClass)
            listAssetsDiv.appendChild(sublist)

            let assetTitle = document.createElement('p')
            assetTitle.setAttribute('class', 'list-sub-title')
            assetTitle.innerHTML = sub.lookup
            sublist.appendChild(assetTitle)

            let ghg = document.createElement('p')
            ghg.setAttribute('class', 'list-sub')
            ghg.innerHTML = sub.ghg
            sublist.appendChild(ghg)

            let unitM = document.createElement('p')
            unitM.setAttribute('class', 'list-sub')
            unitM.innerHTML = sub.uom
            sublist.appendChild(unitM)

            let factor = document.createElement('p')
            factor.setAttribute('class', 'list-sub')
            factor.innerHTML = sub.conversionfactor
            sublist.appendChild(factor)
        })

    })






}