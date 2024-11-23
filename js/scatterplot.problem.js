function scatter_plot(data,
    ax,
    title="",
    xCol="",
    yCol="",
    rCol="",
    legend=[],
    colorCol="",
    margin = 50)
{
    // Extract data columns for x-axis, y-axis, and radius
    const X = data.map(d => d[xCol]);
    const Y = data.map(d => d[yCol]);
    const R = data.map(d => d[rCol]);

    // Get unique categories for the color column
    const colorCategories = [...new Set(data.map(d => d[colorCol]))]; 

    // Set up the color scale for different categories
    const color = d3.scaleOrdinal()
        .domain(colorCategories)
        .range(d3.schemeTableau10);

    // Get the min and max values for x and y axes
    const xExtent = d3.extent(X, d => +d);
    const yExtent = d3.extent(Y, d => +d);

    // Add a 5% margin to the scales
    const xMargin = (xExtent[1] - xExtent[0]) * 0.05; 
    const yMargin = (yExtent[1] - yExtent[0]) * 0.05;

    // Define x-axis scale
    const xScale = d3.scaleLinear()
        .domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
        .range([margin, 1000 - margin]);

    // Define y-axis scale
    const yScale = d3.scaleLinear()
        .domain([yExtent[0] - yMargin, yExtent[1] + yMargin])
        .range([1000 - margin, margin]);

    // Define radius scale for circles
    const rScale = d3.scaleSqrt().domain(d3.extent(R, d => +d))
           .range([4, 12]);

    // Select the SVG element for the scatter plot
    const Fig = d3.select(`${ax}`);

    // Add scatter plot circles
    Fig.selectAll('.markers')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${xScale(d[xCol])}, ${yScale(d[yCol])})`) // Position circles based on x and y scales
        .append('circle')
        .attr("class", (d, i) => `cls_${i} ${d[colorCol]}`) // Assign class based on index and category
        .attr("id", (d, i) => `id_${i} ${d[colorCol]}`) // Assign unique ID
        .attr("r", d => rScale(d[rCol])) // Set circle radius
        .attr("fill", d => color(d[colorCol])); // Set circle color

    // Define x-axis and y-axis
    const x_axis = d3.axisBottom(xScale).ticks(4);
    const y_axis = d3.axisLeft(yScale).ticks(4);

    // Add x-axis to the plot
    Fig.append("g").attr("class", "axis")
        .attr("transform", `translate(${0},${1000 - margin})`)
        .call(x_axis);

    // Add y-axis to the plot
    Fig.append("g").attr("class", "axis")
        .attr("transform", `translate(${margin},${0})`)
        .call(y_axis);

    // Add x-axis label
    Fig.append("g").attr("class", "label")
        .attr("transform", `translate(${500},${1000 - 10})`)
        .append("text")
        .attr("class", "label")
        .text(xCol) // Display x-axis label
        .attr("fill", "black");

    // Add y-axis label
    Fig.append("g")
        .attr("transform", `translate(${35},${500}) rotate(270)`)
        .append("text")
        .attr("class", "label")
        .text(yCol) // Display y-axis label
        .attr("fill", "black");

    // Add title to the scatter plot
    Fig.append('text')
        .attr('x', 500)
        .attr('y', 80)
        .attr("text-anchor", "middle")
        .text(title)
        .attr("class", "title")
        .attr("fill", "black");

    // Define a brush for selecting points
    const brush = d3.brush()
        .on("start", brushStart) // On brush start event
        .on("brush end", brushed) // On brush or brush end event
        .extent([
            [margin, margin],
            [1000 - margin, 1000 - margin]
        ]);

    // Add brush to the figure
    Fig.call(brush);

    // Brush start function to clear previous selections
    function brushStart() {
        if (d3.brushSelection(this)[0][0] === d3.brushSelection(this)[1][0]) {
            // Clear selected points if no area is selected
            d3.selectAll("circle").classed("selected", false);                      // MISSING PART 4
            d3.select("#selected-list").selectAll("li").remove(); // Clear list     // MISSING PART 4
        }
    }

    // Brush function to select points within the brush area
    function brushed() {
        let selected_coordinates = d3.brushSelection(this);

        if (!selected_coordinates) return; // Exit if no selection

        // Convert brush selection bounds to data values
        const X1 = xScale.invert(selected_coordinates[0][0]);
        const X2 = xScale.invert(selected_coordinates[1][0]);
        const Y1 = yScale.invert(selected_coordinates[0][1]);
        const Y2 = yScale.invert(selected_coordinates[1][1]);

        // Select circles within the selected bounds
        const selectedPoints = d3.selectAll("circle").classed("selected", (d, i) => {
            if (+d[xCol] >= X1 && +d[xCol] <= X2 && +d[yCol] <= Y1 && +d[yCol] >= Y2) {
                return true;
            }
            return false;
        });

        // Update the list with selected points
        if (selectedPoints.size() === 0) {
            d3.select("#selected-list").selectAll("li").remove();
            d3.select("#selected-list").append("li").text("No points selected");
        } else {
            const ids = [...new Set(selectedPoints.nodes().map(d => +d.id.split(" ")[0].slice(3)))];
            d3.select("#selected-list")
                .selectAll("li")
                .data(ids)
                .enter()
                .append("li")
                .attr("class", "listVals")
                .text(d => {
                   const selectedData = data[d];
                   return `${selectedData.Model}, ${selectedData.Type}`; // Display Model and Type of selected data
                });
        }
    }

    // Add legend to the scatter plot
    const legendContainer = Fig
        .append("g")
        .attr("transform", `translate(${800},${margin})`)
        .attr("class", "marginContainer");

    if (legend.length === 0) { legend = colorCategories; }

    const legends_items = legendContainer.selectAll("legends")
        .data(legend)
        .join("g")
        .attr("transform", (d, i) => `translate(${0},${i * 45})`);

    // Add colored rectangles for the legend
    legends_items.append("rect")
        .attr("fill", d => color(d)) // Assign color for each category
        .attr("width", "40")
        .attr("height", "40")
        .attr("class", d => `legend-rect ${d}`)
        .style("cursor", "default") 
        .on("click", function (event, d) {                                          // MISSING PART 5
            const isActive = d3.select(this).classed("active");                     // MISSING PART 5

            // Toggle legend rectangle state and update corresponding circles
            d3.selectAll(`rect.legend-rect.${d}`)                                   // MISSING PART 5
                .classed("active", !isActive)                                       // MISSING PART 5
                .style("fill", isActive ? "#d3d3d3" : color(d));                    // MISSING PART 5

            d3.selectAll(`circle.${d}`)                                             // MISSING PART 5
                .style("opacity", isActive ? 0.1 : 1);                              // MISSING PART 5
        });                                                                         // MISSING PART 5

    // Set all circles and legend items initially visible and active
    d3.selectAll("circle").style("opacity", 1);                                     // MISSING PART 5
    d3.selectAll(".legend-rect").classed("active", true).each(function (d) {        // MISSING PART 5
        d3.select(this).style("fill", color(d));                                    // MISSING PART 5
    });                                                                             // MISSING PART 5

    // Add text labels to the legend
    legends_items
        .append("text")
        .text(d => d) // Display the legend text (e.g., category name)
        .attr("dx", 45)
        .attr("dy", 25)
        .attr("class", "legend")
        .attr("fill", "black")
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            const isActive = d3.select(`rect.legend-rect.${d}`).classed("active");

            // Toggle visibility of circles and legend rectangles for the category
            d3.selectAll(`rect.legend-rect.${d}`)
                .classed("active", !isActive)
                .style("fill", isActive ? "#d3d3d3" : color(d));

            d3.selectAll(`circle.${d}`)
                .style("opacity", isActive ? 0 : 1);
        });
}