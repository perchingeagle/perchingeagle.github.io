function init() {
  // Grab a reference to the dropdown select element
  let selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    let sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    const metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    const resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    const result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    let PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sampleId) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array.
    const allSamples =  data.samples;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    const  samples = allSamples.filter((item) => item.id === sampleId);

    //  5. Create a variable that holds the first sample in the array.
    const sample = samples[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.

    let list = [];

    for(let i = 0; i < sample.sample_values.length; i++){
      list.push(
        {
          otu_ids: sample.otu_ids[i],
          otu_labels: sample.otu_labels[i],
          sample_values: sample.sample_values[i]
        }
      );
    }

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 


    let topTen = list.sort((a, b) => b.otu_ids - a.otu_ids).slice(0, 10);

    const yticks = topTen.map((item) => {
      return "OTU "+item.otu_ids;
    });
    const xticks = topTen.map((item) => {
      return item.sample_values;
    });

    // 8. Create the trace for the bar chart. 
    let barData = [{
      x: xticks,
      y: yticks,
      type: "bar",
      orientation: "h"
    }];
    
    // 9. Create the layout for the bar chart. 
    let barLayout = {
      title: "Top 10 Bacteria Cultures Found"
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    const sampleValues = topTen.map((item) => item.sample_values)

    // 1. Create the trace for the bubble chart.
    const bubbleData = [
      {
        x: topTen.map((item) => item.otu_ids),
        y: sampleValues,
        text: topTen.map((item) => item.otu_labels),
        mode: "markers",
        marker: {
          color: ["#FF33FF", "#FF0033", "#6699FF", 
                  "#66FF33", "#00CCFF", "#99CCCC",
                  "#993333", "#666600","#e7a4b6",
                  "#996633"],
          size: sampleValues
        }
      }
    ];
    
    // 2. Create the layout for the bubble chart.
    const bubbleLayout = {
      title: "Bacteria Cultures Per Sample"
    };
    
    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    
    // 4. Create the trace for the gauge chart.
    let metadata = data.metadata.filter((item) => item.id === parseInt(sampleId))[0];
    console.log(metadata);
    console.log(sampleId);

    const gaugeData = [{
      domain: {x: [0,1], y: [0, 1]},
      value: parseFloat(metadata.wfreq),
      type: "indicator",
      mode: "gauge+number"
    }];
        
    // 5. Create the layout for the gauge chart.
    const gaugeLayout = {};
    
    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData);

  });

}


