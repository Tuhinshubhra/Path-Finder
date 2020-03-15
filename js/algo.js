// ------------------------------ [A L G O R I T H M] ---------------------------------

function f_findPath(){
	if (g_startSorting){
		if (g_startingNode != undefined && g_endingNode != undefined && g_frameCount%parseInt(g_FPS/g_animSpeed) == 0 && g_isDone == false){
			// we have starting and ending nodes
			// ok let's start the sorting, first let's start with the starting node and find it's neighbours
			g_selectedNode = undefined;
			if (g_currentNode == undefined && g_openList.length ==0){
				g_openList.push(g_startingNode); // push starting node into the open list
				g_nodes[g_startingNode].g = 0;   // set g of starting node to 0 so that the childs can have g += parent's g+1
				g_currentNode = g_openList[0]    // current node to process
				l_isfound     = false;	
			}


			if (g_openList.length > 0){

				// remove self from open list
				for (var x=0; x<g_openList.length; x++){
					if (g_nodes[g_openList[x]].id == g_nodes[g_currentNode].id){
						g_openList.splice(x, 1); // remove self from open list
						break;
					}
				}

				// remove is current 
				g_nodes[g_currentNode].isCurrent = false;


				// find the neighbours of the node and fill the neighbours' G values
				g_neighbours  = f_findNeighbours(g_currentNode);
				// console.log("it's neighbours: " + g_neighbours[1])

				// THE IMPORTANT STEP! we process the node and find if it's the last one and also add it's neighbours to the open list
				l_processNode = f_processNode(g_currentNode, g_neighbours[1]);

				if (l_processNode[0] == true){
					l_isfound = true
				} else {
					g_currentNode = f_findNodeWithLowestF(); // set the current node as the one with lowest f
					if (g_currentNode == Infinity || g_currentNode == undefined){
						l_isfound == false;
					} else {
						// console.log(g_currentNode);
						g_nodes[g_currentNode].isCurrent = true;
					}
				}
			} else {
				if (g_isDone == false){
					g_isDone    = true;
					g_pathFound = false;
					//alert('No path found!');
				}
			}


			if (l_isfound == true){
				g_mainChild = g_currentNode;
				g_isDone    = true;
				g_pathFound = true;
			} else if (g_openList.length == 0){
				g_isDone    = true;
				g_pathFound = false;
				//alert('No path found!');
			}

		} else if (g_startingNode == undefined || g_endingNode == undefined) {
			// Starting and/or Ending nodes were not defined.
			alert('Umm.. Would you mind specifying the starting and eding nodes?');
			g_startSorting = false;
		}
	}
}

function f_findNodeWithLowestF(){
	// First sorts the open list and then finds the element with lowest f
	// If there are two nodes with same f get the one with lowest H

	g_openList.sort(); // arrange in ascending order
	var l_lowest = [undefined, Infinity]

	for (var i=0; i<g_openList.length; i++){

		if (g_nodes[g_openList[i]].f < l_lowest[1]){

			// If the current node has lower f than any previous!
			l_lowest = [g_openList[i], g_nodes[g_openList[i]].f]

		} else if (g_nodes[g_openList[i]].f == l_lowest[1]){

			// They both have the same f values let's get the one with the lowest g and replace it
			if (g_nodes[g_openList[i]].h < g_nodes[l_lowest[0]].h){
				l_lowest = [g_openList[i], g_nodes[g_openList[i]].f]
			}

		}
	}
	return l_lowest[0]; // return the ID of the node that has the lowest f
}

function f_processNode(l_node, g_neighbours){
	// calculates the f of the neighbours and adds self to closed list
	// returns [true/false/undefined, next neighbour with the lowest f]
	// true means h = 1 false means it's greater and undefined means it's a dead end

	// calculate the f of self first
	l_f = g_nodes[l_node].g + f_calculateH(l_node);
	g_nodes[l_node].f  = l_f	
	// console.log("g: " +g_nodes[l_node].g + " h: " + g_nodes[l_node].h)

	// add self to closed list
	g_closedList.push(l_node);
	g_nodes[l_node].isClosed  = true;
	g_nodes[l_node].isScanned = true;

	for (var i=0; i<g_neighbours.length; i++){
		if (g_neighbours[i] == g_endingNode){
			return [true, null]
		}
	}

	if (g_nodes[l_node].h === 1){
		// if h === 1 we have found it
		return [true, null]
	}

	if (g_neighbours.length === 0){
		// well it's a dead end, it has no neighbours
		return [undefined, null]
	}

	// Since it has neighbours and it's not the closed node to ending node let's find the fs of the neighbours
	var l_n_f = 0;                          // local_neighbour_f value
	var l_neighbourWithLowestF = Infinity;  // contains the lowest f of the local neighbour 
	var l_retNeighbour = Infinity;          // The neighbour to return

	for (var i=0; i<g_neighbours.length; i++){
		// calculate fs and 
		l_n_f = g_nodes[g_neighbours[i]].g + f_calculateH(g_neighbours[i]);
		g_nodes[g_neighbours[i]].f = l_n_f


		// update the l_neighbourWithLowestF
		if (l_n_f < l_neighbourWithLowestF) {
			l_retNeighbour         = g_neighbours[i];
			l_neighbourWithLowestF = l_n_f;
		} else if (l_n_f == l_neighbourWithLowestF){
			// two neighbours have the same f, now we check the one with lowest g
			if (g_nodes[l_retNeighbour].h > g_nodes[g_neighbours[i]].h){
				l_retNeighbour = g_neighbours[i];
			}
		}
	}
	return [false, l_retNeighbour];
}

function f_calculateH(l_node){
	// H is the distance from the selected node to the ending node
	if (g_nodes[l_node].h != undefined){
		return g_nodes[l_node].h;
	} else {
		// we have to calculate it
		l_dx = Math.abs(g_nodes[l_node].column - g_nodes[g_endingNode].column)
		l_dy = Math.abs(g_nodes[l_node].row - g_nodes[g_endingNode].row)

		if (g_heuristic == 'm'){
			l_h = l_dx + l_dy; // menhattan
		} else if (g_heuristic == 'e'){
			l_h = Math.sqrt(l_dx * l_dx + l_dy * l_dy); // eucledian
		} else if (g_heuristic == 'o'){
			var F = Math.SQRT2 - 1;
			l_h = (l_dx < l_dy) ? F * l_dx + l_dy : F * l_dy + l_dx; //octile
		} else if (g_heuristic == 'c'){
			l_h = Math.max(l_dx, l_dy)  //chebyshev
		}
		// set this.h
		g_nodes[l_node].h = l_h;
		return l_h;
	}
}

function f_findNeighbours(l_nodeIndex){
	// finds the neighbours of a specific node
	// returns with an array => [true/false, [n1, n2, n3]]
	// true if neighbour found and false if no neighbour is found
	g_neighbours           = [];
	var l_currentNeighbour = l_nodeIndex -1; 

	// check left (-1)
	if (f_validateNeighbour(l_currentNeighbour) && g_nodes[l_currentNeighbour].row == g_nodes[l_nodeIndex].row){
		f_pushNeighbour(l_currentNeighbour, l_nodeIndex);
	}

	// check Right (+1)
	l_currentNeighbour = l_nodeIndex + 1;
	if (f_validateNeighbour(l_currentNeighbour) && g_nodes[l_currentNeighbour].row == g_nodes[l_nodeIndex].row){
		f_pushNeighbour(l_currentNeighbour, l_nodeIndex);
	}

	// check Top (-columnCount)
	l_currentNeighbour = l_nodeIndex + g_numColumns;
	if (f_validateNeighbour(l_currentNeighbour)){
		f_pushNeighbour(l_currentNeighbour, l_nodeIndex);
	}

	// check Bottom (+ColumnCount)
	l_currentNeighbour = l_nodeIndex - g_numColumns;
	if (f_validateNeighbour(l_currentNeighbour)){
		f_pushNeighbour(l_currentNeighbour, l_nodeIndex);
	}

	// if allowed diagonal
	if (g_allowDiagonal){
		l_currentNeighbour = l_nodeIndex - g_numColumns + 1;
		try {
			if (f_validateNeighbour(l_currentNeighbour)){
				(g_nodes[l_currentNeighbour].row == g_nodes[l_nodeIndex-g_numColumns].row) ? f_pushNeighbour(l_currentNeighbour, l_nodeIndex) : null;
			}
		} catch {}

		l_currentNeighbour = l_nodeIndex - g_numColumns - 1;
		try {
			if (f_validateNeighbour(l_currentNeighbour)){
				(g_nodes[l_currentNeighbour].row == g_nodes[l_nodeIndex-g_numColumns].row) ? f_pushNeighbour(l_currentNeighbour, l_nodeIndex) : null;
			}
		} catch {}

		l_currentNeighbour = l_nodeIndex + g_numColumns + 1;
		try{
			if (f_validateNeighbour(l_currentNeighbour) && g_nodes[l_currentNeighbour].row == g_nodes[l_nodeIndex+g_numColumns].row){
				f_pushNeighbour(l_currentNeighbour, l_nodeIndex);
			}
		} catch {}
		l_currentNeighbour = l_nodeIndex + g_numColumns - 1;
		try {
			if (f_validateNeighbour(l_currentNeighbour) && g_nodes[l_currentNeighbour].row == g_nodes[l_nodeIndex+g_numColumns].row){
				f_pushNeighbour(l_currentNeighbour, l_nodeIndex);
			}
		} catch {}
	}

	// return the value

	return [((g_neighbours.length>0) ? true : false), g_neighbours]

}

function f_pushNeighbour(l_nid, l_pid){
	g_neighbours.push(l_nid);
	g_openList.push(l_nid);
	g_nodes[l_nid].parent = l_pid; // set the parent parameter
	g_nodes[l_nid].g = g_nodes[l_pid].g + 1; // set g val
	g_nodes[l_nid].isNeighbour = true;
}

function f_validateNeighbour(l_nid){
	// console.log('Validating: ' + l_nid);
	try {
		if (l_nid>=0 && !g_nodes[l_nid].isClosed && g_nodes[l_nid].type != 'o' && g_nodes[l_nid].parent == undefined && l_nid<=g_numNodes-1){
			return true;
		} else {
			return false;
		}
	} catch {
		return false;
	}
}
