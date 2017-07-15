# synapse-viewer

plotting 3D scatter plots with plotly.js for synapse dataset

## File Formats

The viewer assumes a simple CSV file format with expected columns of
**X**, **Y**, and **Z** as coordinates, and **raw core** is the default 
intensity value

The synapse-viewer can be invoked with one or more CSV datafiles

The viewer plots a single scatter point cloud when supplied with one
CSV datafile and mulitple subplots when supplied with more than one 
CSV datafiles. The subplots are linked within.

## Download and Run 

You can clone the source repository with Git by running:

  git clone https://github.com/informatics-isi-edu/synapse-viewer.git

and invoke the viewer as in **Examples**

## Parameters
 
Parameters are optional and are organized per **url**, first in-first out. If
not completely specified, earlier settings are assumed to be the globally 
defined.  They are used to alter the look and feel of the point cloud.

| Parameter | type | Note | Description |
| --- | --- | --- | --- |
| **stepX** | float | scale on x axis | microns-per-pixel grid spacing for X dimension |
| **stepY** | float | scale on y axis | microns-per-pixel grid spacing for Y dimension | 
| **stepZ** | float | scale on z axis | microns-per-pixel grid spacing for Z dimension |
| **size** | integer | marker size | data point's pixel size |
| **opacity** | float | marker opacity | data point's opacity, range from 0 to 1  |
| **alias** | chars | datafile | label for datafile |
| **color** | chars | trace color| **rgb(16,32,77)**, **blue**, **10204D**, or **#10204D**. There is a default set of color being used if none is specified |
| **title** | chars | plot title | title of the plot |
| **heat** | chars | column label | column to be use as the intensity values to color the data point |
| **heatOn** | chars | true/false | scatter plot with data points colored by corresponding intensity values from the 'heat' column |


## Examples

Plot a single 3D scatter plot with a single CSV

```
view.html?url=http://localhost/data/data1.csv
            stepX=0.26&
            stepY=0.26&
            stepZ=0.4

```

Plot a single 3D scatter plot with a single CSV

```
view.html?url=http://localhost/data/segment1.csv&
            stepX=0.26&
            stepY=0.26&
            stepZ=0.4&
            size=1&
            opacity=0.7&
            alias='first one'&
            color=green&
            heat='raw core'&
            heatOn=true

```

Plot subplots with multiple CSV datafiles

```
view.html?stepX=0.26&
          stepY=0.26&
          stepZ=0.4&
          title='Title of the plot'
          url=http://localhost/data/data1.csv&
          alias='first one'&
          color=green&
          url=http://localhost/data/data2.csv&
          alias='second file'&
          color=red

```

spin.html: Allows multiple point clouds from different datafiles to 
be plotted on the same 3D scatter plot and spinning animation by z axis

Options of specifying meta global configuration and runtime local 
configuraiton in a json structured format is also available. Please see
viewer-synapse.js for samples

Sample plots are in sample1.png, sample2.png, sample3.png and sample4.png
