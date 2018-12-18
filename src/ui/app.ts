import { Dense, Conv2D, Layer, MaxPooling2D } from "./shapes/layer";
import { Draggable } from "./shapes/draggable";
import { Relu, Sigmoid, Tanh } from "./shapes/activation";
import { windowProperties } from "./window";
import { buildNetwork, train, buildNetworkDAG } from "../model/build_network";
import { buildDefaultTemplate } from "./model_templates";

document.addEventListener("DOMContentLoaded", function() { 
    // this function runs when the DOM is ready, i.e. when the document has been parsed
    var elmts = document.getElementsByClassName('option');
	for(let elmt of elmts){
		highlightOnMouseOver(elmt);
		dispatchCreationOnClick(elmt);
	}
	
	var elmts = document.getElementsByClassName('train');
	for(let elmt of elmts){
		trainOnHighlight(elmt);
		trainOnClick(elmt)
	}
    
    window.addEventListener('create', function( e ) {
		appendItem(e);
	});

	window.onkeyup = function(event){
		switch(event.key){
			case 'Escape' :
				if(windowProperties.selectedElement){
					windowProperties.selectedElement.unselect();
					windowProperties.selectedElement = null;
				}
				break;
			case 'Delete' :
				if(windowProperties.selectedElement){
					windowProperties.selectedElement.delete();
					windowProperties.selectedElement = null;
				}
				break;
			case 'Enter' :
				// graphToJson();
				train(buildNetwork(svgData.input))
				break;
		}
	};

	buildDefaultTemplate(svgData)
});

function trainOnHighlight(elmt){
	elmt.addEventListener('mouseover',function(e){
		elmt.style.background = '#00008B'
	});
	elmt.addEventListener('mouseout',function(e){
		elmt.style.background = '#447344'
	});
}


function trainOnClick(elmt){
	elmt.addEventListener('click', async function(e){
		let trainingBox = document.getElementById('ti_training');
		trainingBox.children[1].innerHTML = 'Yes'
		elmt.innerHTML = "Training"
		// TODO: Change color during training
		// elmt.style.backgroundColor = '#900000'
		let model = buildNetworkDAG(svgData.output)
		console.log("Built Model... ")
		console.log(model)
		await train(model)
		elmt.innerHTML = "Train"
		trainingBox.children[1].innerHTML = 'No'
		// elmt.style.background = '#007400'
	});
}

function graphToJson() {
	// Initialize queues, dags, and parents (visited) 
	let queue: Layer[] = [svgData.input]
	let visited: Set<Layer> = new Set()
	let json: {}[] = []
	while (queue.length != 0) {
		let current = queue.shift()
		json.push(current.toJson())
		// check each connections of the node
		for (let child of current.children) {
			if (!visited.has(child)) {
				queue.push(child)
				visited.add(child)
			}
		}
	}
	console.log(json)
}

function highlightOnMouseOver(elmt){
	elmt.addEventListener('mouseover',function(e){
		elmt.style.backgroundColor = '#ccc'
	});
	elmt.addEventListener('mouseout',function(e){
		elmt.style.backgroundColor = 'transparent'
	});
}

function dispatchCreationOnClick(elmt){
	elmt.addEventListener('click', function(e){
        var itemType = elmt.parentElement.getAttribute('data-itemType')
        var detail = { itemType : itemType}
        detail[itemType + 'Type'] = elmt.getAttribute('data-'+itemType+'Type')
        var event = new CustomEvent('create', { detail : detail } );
		window.dispatchEvent(event);
	});
}

function appendItem(options){
	var item: Draggable
	switch(options.detail.itemType){
        case 'layer': switch(options.detail.layerType) {
			case "dense": item = new Dense(); console.log("Created Dense Layer"); break;
			case "conv2D": item = new Conv2D(); console.log("Created Conv2D Layer"); break;
			case "maxPooling2D": item = new MaxPooling2D(); console.log("Created MaxPooling2D Layer"); break;
		}
		case 'activation': switch(options.detail.activationType) {
			case 'relu': item = new Relu(); console.log("Created Relu"); break;
			case 'sigmoid': item = new Sigmoid(); console.log("Created Sigmoid"); break;
			case 'tanh': item = new Tanh(); console.log("Created Tanh"); break;
		}
	}
	svgData.draggable.push(item);
}


let svgData = {
	draggable : [],
	// activation : [],
	// wire : [],
	input: null,
	output: null
}