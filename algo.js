		console.log('shit works');
		/*-----------------------------------------------------------------------------------*\
		|*                                  NEEDED VARIABLES                                  |
		\*-----------------------------------------------------------------------------------*/
		
		var g_animSpeedinp  = document.getElementById('animspeed');
		var g_nodeSizeinp   = document.getElementById('nodesize');
		var g_myCanvas      = document.getElementById('myCanvas');
		var g_dbgInfoinp    = document.getElementById('dbginfo');
		var g_diagnoalinp   = document.getElementById('diagonal');
		var g_heuristicinp  = document.getElementById('heuristic');
		var g_asv           = document.getElementById('asv');            // animation speed value
		var g_adv           = document.getElementById('adv');            // allow diagonal value
		var g_nsv           = document.getElementById('nsv');            // node size value
		var g_dv            = document.getElementById('dv');             // debug value
		var g_context       = g_myCanvas.getContext('2d');
		g_myCanvas.height   = document.getElementById('visualize').clientHeight;
		g_myCanvas.width    = document.getElementById('visualize').clientWidth;
		var g_nodeWidth     = 40;                                         // Width of the node squares
		var g_numRows       = parseInt(g_myCanvas.height/g_nodeWidth -1); // Total number of rows
		var g_numColumns    = parseInt(g_myCanvas.width/g_nodeWidth -1);  // Total number of columns
		var g_numNodes      = g_numRows * g_numColumns;                   // Total number of nodes
		var g_FPS           = 30;                                         // Frame Per Second
		var g_timeInterval  = 1000/g_FPS;                                 // Time interval the gameloop is executed in ms
		var g_nodes         = new Array(g_numNodes);                      // Holds all the nodes
		var g_mouseX        = undefined;                                  // Mouse Y Co-ordinate
		var g_mouseY        = undefined;                                  // Mouse X Co-ordinate
		var g_clickType     = undefined;                                  // "right" or "left"
		var g_currentKey    = undefined;                                  // Current key pressed!
		var g_selectedNode  = undefined;                                  // index of node currently selected
		var g_selectorWidth = 5;                                          // lineWidth of the selector
		var g_object        = undefined;                                  // the object that lost it's home
		var g_startingNode  = undefined;                                  // Starting Node
		var g_endingNode    = undefined;                                  // Target node
		var g_openList      = [];                                         // OPEN LIST
		var g_closedList    = [];                                         // CLOSED LIST
		var g_pathFound     = false;                                      // if the path is found it changes to true
		var g_startSorting  = false;                                      // when set to true executes the path finder function
		var g_mainChild     = undefined;                                  // Used when tracing path
		var g_isDone        = false;                                      // Is the path finding function executed!
		var g_frameCount    = 0;                                          // Count Frames
		var g_timePassed    = 0;                                          // Count seconds
		var g_pathNodes     = [];                                         // path from start to end
		var g_currentNode   = undefined;                                  // the node being scanned
		var g_neighbours    = [];                                         // neighbours of the node scanned
		var g_animSpeed     = 4                                           // time%fps/animSpeed, default: 4
		var g_showdbginfo   = true                                        // for now all that debug info shows or hides is the node id
		var g_heuristic     = 'm'                                         // 'm', 'e', 'c', 'o'. Default m
		var g_allowDiagonal = false                                       // is diagonal movement allowed
		var g_reachedHome   = false                                       // object reached home
		
		/*-----------------------------------------------------------------------------------*\
		|*                                     NODE CLASS                                     |
		\*-----------------------------------------------------------------------------------*/
		
		function c_node(l_x, l_y, l_width, l_id, l_row, l_column){
			
			// Node Properties
			this.x           = l_x;         // X Co-ordinate
			this.y           = l_y;         // Y Co-ordinate
			this.width       = l_width;     // width of rect
			this.fontSize    = l_width/4;   // font size
			this.h           = undefined;   // h = dist from ending node
			this.g           = undefined;   // g = dist from starting node
			this.f           = undefined;   // f = g+h
			this.row         = l_row;       // Row number of the node
			this.column      = l_column;    // Column number of the node
			this.id          = l_id;        // Index of the node
			this.type        = "empty";     // empty, s, e, o or [start/end/obstacle]
			this.isClosed    = false;       // set to true when this object is sent to closed list
			this.parent      = undefined;   // Parent node ID/index
			this.isSelected  = false;       // is it currently clicked
			this.isPath      = false;       // is it a path node
			this.isCurrent   = false;       // is this node currently being scanned
			this.isNeighbour = false;       // is this node a neighbour of the currently scanned node
			this.isScanned   = false;       // is this node scanned
			this.rippleRad   = 0;           // ripple radius
			
			// Node Methods
			this.m_draw = (l_context, l_showDBG, l_reachedhome) => {
				l_context.strokeStyle = (this.type == 's') ? "greenyellow" : 
				(this.type == 'e') ? 'orange' : 
				(this.isCurrent) ? 'white' :
				(this.isScanned) ? 'aqua' :
				(this.isNeighbour) ? 'blue' :
				"gray";
				
				l_context.fillStyle   = (this.type == 's') ? "greenyellow" : 
				(this.type == 'o') ? 'black' : 
				(this.type == 'e') ? 'orange' : 
				(this.isCurrent) ? 'white' :
				(this.isScanned) ? 'aqua' :
				(this.isNeighbour) ? 'blue' :
				"black";
				
				if (this.isPath){
					// fill style is lime if the node is a path
					l_context.fillStyle = "lime";
				}
				//l_context.fillRect(this.x+5, this.y+5, this.width-10, this.width-10)
				l_context.fillRect(this.x, this.y, this.width, this.width)
				l_context.strokeRect(this.x, this.y, this.width, this.width)
				
				// write the node ID in the center of the node
				if (l_showDBG){
					l_context.fillStyle = (this.type == 'empty' && !this.isPath && !this.isScanned) ? "white" : "black";
					l_context.font = this.fontSize + 'px monospace';
					l_context.textAlign = 'center'
					l_context.fillText(this.id, this.x+this.width/2, this.y+this.width/2)
				}
				
				
				if (this.type == 'o'){
					// node type = obstacle
					// draw the circle
					l_context.fillStyle = "red"
					l_context.beginPath();
					l_context.arc(
						this.x + this.width/2, this.y + this.width/2, this.width/2-3, 0, Math.PI * 2
					);
					l_context.fill();
					l_context.closePath();
					
					// draw the X
					l_context.strokeStyle = 'black';
					l_context.moveTo(this.x + this.width/4, this.y + this.width/4);
					l_context.lineTo(this.x+this.width-this.width/4, this.y+this.width-this.width/4)
					l_context.moveTo(this.x+this.width-this.width/4, this.y+this.width/4)
					l_context.lineTo(this.x+this.width/4, this.y+this.width-this.width/4)
					l_context.stroke();	
				} else if (this.type == 'e' && l_reachedhome){
					// the ripple effect
					(this.rippleRad < this.width/2) ? this.rippleRad++ : this.rippleRad = 0;
					l_context.lineWidth = 3;
					l_context.strokeStyle = "black"
					l_context.beginPath();
					l_context.arc(
						this.x + this.width/2, this.y + this.width/2, this.rippleRad, 0, Math.PI * 2
					);
					l_context.stroke();
					l_context.closePath();
					l_context.lineWidth = 1;
				}
				
				/** // show g and h
				if (this.width > 70 && l_showDBG){
					if (this.h != undefined && this.g != undefined){
						l_context.font = '20px monospace';
						l_context.textAlign = 'left'
						l_context.fillText(this.h, this.x+5, this.y+30)
					}
				}
				**/
			}		
		}
		
		
		function c_object(l_x, l_y, l_radius, l_color, l_speed){
			this.x        = l_x;
			this.y        = l_y;
			this.radius   = l_radius;
			this.color    = l_color;
			this.targetX  = l_x;
			this.targetY  = l_y;
			this.speed    = l_speed;
			this.isDone   = false;
			this.isMoving = false;
			
			this.m_draw = (l_context) => {
				if (!this.isDone){
				l_context.fillStyle = "black"
				l_context.beginPath();
				l_context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
				l_context.fill();
				l_context.closePath();}
			}
			
			this.m_move = () => {
				if (this.targetX > this.x){
					this.x += this.speed;
					this.isMoving = true;
				} else if (this.targetX < this.x){
					this.x -= this.speed;
					this.isMoving = true;
				} 
				
				if (this.targetY > this.y){
					this.y += this.speed;
					this.isMoving = true;
				} else if (this.targetY < this.y){
					this.y -= this.speed;
					this.isMoving = true
				} 
				
				if (this.x == this.targetX && this.y == this.targetY) {
					this.isMoving = false;
				}
			}
			
			}
		
		
		/*-----------------------------------------------------------------------------------*\
		|*                                  NEEDED FUNCTIONS                                  |
		\*-----------------------------------------------------------------------------------*/
		
		// ------------------------------ [NODE Related] ------------------------------------
		
		function f_generateNodes(){
			// Generates nodes and the object
			
			var l_leftPadding = (g_myCanvas.width - (g_numColumns * g_nodeWidth))/2;
			var l_topPadding  = (g_myCanvas.height - (g_numRows * g_nodeWidth))/2;
			var l_row  = 1; // Keep track of current row num
			
			for (var n=0; n<g_numNodes; n++){
				if (n+1 > l_row*g_numColumns){
					l_row++
				}
				
				var l_column = ((n+1) - ((l_row-1)*g_numColumns)) // Column of the nide
				
				g_nodes[n] = new c_node(
					l_leftPadding + ((l_column-1) * g_nodeWidth), // x
					l_topPadding + (g_nodeWidth * (l_row-1)),     // y
					g_nodeWidth,                                  // width
					n,                                            // ID
					l_row,                                        // Row num
					l_column                                      // Column num
				)
			}
			
			g_object = new c_object(0, 0, g_nodeWidth/4, "black", g_nodeWidth/8);
		}
		
		// ------------------------------- [User Input Handling]-----------------------------
		
		function f_checkClick(){
			if (g_isDone == true && g_mouseX != undefined && g_mouseY !== undefined){
				// alert('Refresh page to start a new session!');
				// reinit
				//f_init();
				g_mouseX = g_mouseY = undefined;
				return;
			}
			
			if (g_mouseX != undefined && g_mouseY !== undefined){
				// check which node was clicked on
				for (var n=0; n<g_numNodes; n++){
					if ((g_mouseX >= g_nodes[n].x && g_mouseX <= g_nodes[n].x + g_nodes[n].width) && 
						(g_mouseY >= g_nodes[n].y && g_mouseY <= g_nodes[n].y + g_nodes[n].width)){
						if (g_clickType == 'left'){
							// node matched! let's reset isSelected flag of the previous node if it's not the current one
							(g_selectedNode != n && g_selectedNode != undefined) ? g_nodes[g_selectedNode].isSelected = false : null;

							g_nodes[n].isSelected = !(g_nodes[n].isSelected) ; // invert isSelected flag
							g_selectedNode     = (g_selectedNode == n) ? undefined : n; // Set to undefined if it's already n else set value to n
							break;
						} else if (g_clickType == 'right'){
							(g_selectedNode == n) ? g_selectedNode == undefined : null;
							g_nodes[n].isSelected = false;
							g_nodes[n].type       = "empty";
						}
					}
				}
				g_mouseX = g_mouseY = g_clickType = undefined;
			}
		}
		
		function f_checkKeys(){
			if (g_isDone == true && g_currentKey!=undefined){
				// alert('Refresh page to start a new session!');
				// f_init();
				g_currentKey = undefined;
				return;
			}
			
			if (g_currentKey!=undefined){
				if (g_currentKey == 'e' || g_currentKey == 'o' || g_currentKey == 's' && g_selectedNode != undefined){
					if (g_currentKey == 's' && g_startingNode != undefined) g_nodes[g_startingNode].type = 'empty'; // reset start
					if (g_currentKey == 'e' && g_endingNode != undefined) g_nodes[g_endingNode].type = 'empty'; // reset end
					
					g_nodes[g_selectedNode].type = g_currentKey;
					
					(g_currentKey == 's') ? g_startingNode = g_selectedNode : (g_currentKey == 'e') ? g_endingNode = g_selectedNode : null; // set the values of startingNode and endingNode if any.
					
					if (g_currentKey == 's') {
						// set object's x and y
						g_object.x = g_object.targetX = g_nodes[g_startingNode].x + g_nodeWidth/2; 
						g_object.y = g_object.targetY = g_nodes[g_startingNode].y + g_nodeWidth/2;
					}
					
					g_currentKey = undefined;
				} else if (g_currentKey != undefined){
					// navigation
					if (g_currentKey == 'left'){
						(g_selectedNode != undefined) ? g_nodes[g_selectedNode].isSelected = false : null;
						g_selectedNode = (g_selectedNode>0 && g_selectedNode != undefined) ? g_selectedNode -= 1 : g_selectedNode = 0;
						g_nodes[g_selectedNode].isSelected = true;
						g_currentKey = undefined;
					} else if (g_currentKey == 'right') {
						(g_selectedNode != undefined) ?  g_nodes[g_selectedNode].isSelected = false : null;
						g_selectedNode = (g_selectedNode<g_numNodes-1 && g_selectedNode != undefined) ? g_selectedNode += 1 : g_selectedNode = 0;
						g_nodes[g_selectedNode].isSelected = true;
						g_currentKey = undefined;
					} else if (g_currentKey == 'up'){
						(g_selectedNode != undefined) ? g_nodes[g_selectedNode].isSelected = false : null;
						g_selectedNode = (g_selectedNode-g_numColumns>0 && g_selectedNode != undefined) ? g_selectedNode -= g_numColumns : g_selectedNode = 0;
						g_nodes[g_selectedNode].isSelected = true;
						g_currentKey = undefined;
					} else if (g_currentKey == 'down'){
						(g_selectedNode != undefined) ? g_nodes[g_selectedNode].isSelected = false : null;
						g_selectedNode = (g_selectedNode+g_numColumns<g_numNodes-1 && g_selectedNode != undefined) ? g_selectedNode += g_numColumns : g_selectedNode = 0;
						g_nodes[g_selectedNode].isSelected = true;
						g_currentKey = undefined;
					}
				}
			}
		}
		
		// --------------------------- [Drawing & Canvas related]----------------------------
		
		function f_drawObjects(){
			for (var i=0; i<g_numNodes; i++){
				g_nodes[i].m_draw(g_context, g_showdbginfo, g_reachedHome)
			}
			if (g_startingNode != undefined){
				g_object.m_draw(g_context);
			}
		}
		
		function f_drawSelector(){
			// Draws a selector outside selected node
			if (g_selectedNode != undefined){
				g_context.strokeStyle = "#ccff00";
				g_context.lineWidth = g_selectorWidth;
				l_tempWidth = g_nodes[g_selectedNode].width+g_selectorWidth*2
				g_context.strokeRect(g_nodes[g_selectedNode].x-g_selectorWidth, g_nodes[g_selectedNode].y-g_selectorWidth,l_tempWidth ,l_tempWidth);	
				g_context.lineWidth = 1;
			}
		}
		
		function f_clearCanvas(){
			g_context.fillStyle   = "black"
			// g_context.lineWidth   = 5
			// g_context.strokeStyle = (g_isDone) ? (g_pathFound) ? "lime" : "red" : "black";
			g_context.fillRect(0, 0, g_myCanvas.width, g_myCanvas.height)
			
			// if (g_frameCount%10 == 0) g_context.strokeRect(0, 0, g_myCanvas.width, g_myCanvas.height);
			g_context.lineWidth   = 1;
		}
		
		function f_endDrawings(){
			if (g_isDone && g_pathFound && g_reachedHome){
				/**
				var l_leftPadding = (g_myCanvas.width - (g_numColumns * g_nodeWidth))/2;
				var l_topPadding  = (g_myCanvas.height - (g_numRows * g_nodeWidth))/2;
				g_context.fillStyle = "black"
				g_context.fillRect(l_leftPadding + 30, l_topPadding + g_myCanvas.height/2 -60, g_myCanvas.width - (2*l_leftPadding) - 60, 60);
				**/
				g_context.font = "30px monospace"
				g_context.fillStyle = "lime"
				g_context.textAlign = "center"
				g_context.fillText('Path found!', g_myCanvas.width/2, g_myCanvas.height-60)
			} else if (g_isDone && !g_pathFound){
				/**
				var l_leftPadding = (g_myCanvas.width - (g_numColumns * g_nodeWidth))/2;
				var l_topPadding  = (g_myCanvas.height - (g_numRows * g_nodeWidth))/2;
				g_context.fillStyle = "black"
				g_context.fillRect(l_leftPadding + 30, l_topPadding + g_myCanvas.height/2 -60, g_myCanvas.width - (2*l_leftPadding) - 60, 60);
				**/
				
				g_context.font = "30px monospace"
				g_context.fillStyle = "red"
				g_context.textAlign = "center"
				g_context.fillText('Too Bad! there\'s no way back home', g_myCanvas.width/2, g_myCanvas.height-60)
			}
			
			if (g_isDone && g_pathFound && g_pathNodes.length > 0){
				// Draw the path
				g_context.moveTo(g_nodes[g_startingNode].x + g_nodes[g_startingNode].width/2, g_nodes[g_startingNode].y + g_nodes[g_startingNode].width/2);
				g_context.lineWidth = 5;
				g_context.strokeStyle = "black";
				for (var i=0; i<g_pathNodes.length; i++){
					if (g_nodes[g_pathNodes[i]].isPath){
						g_context.lineTo(g_nodes[g_pathNodes[i]].x + g_nodes[g_pathNodes[i]].width/2, g_nodes[g_pathNodes[i]].y + g_nodes[g_pathNodes[i]].width/2)
						g_context.stroke();
					}
				}
				if (g_nodes[g_pathNodes[g_pathNodes.length -1]].isPath){
					g_context.lineTo(g_nodes[g_endingNode].x + g_nodes[g_endingNode].width/2, g_nodes[g_endingNode].y + g_nodes[g_endingNode].width/2);
					g_context.stroke();
				}
				
				g_context.lineWidth = 1;
			}
		}
		
		
		function f_TracePath(){
			if (g_isDone && !g_reachedHome){
				l_child = g_mainChild;
				
				if (g_pathNodes.length == 0){
					// fill the pathNodes array
					while (l_child != g_startingNode){
						// console.log('adding ' + l_child + ' to array');
						g_pathNodes.push(l_child);
						l_child = g_nodes[l_child].parent;
					}
					g_pathNodes.reverse(); // reverse the array
					g_mainChild = 0;
					// turn off debug once path found
					g_dbgInfoinp.checked = false;
					g_showdbginfo = false;
					return;
				} else {
					// fill em
					if (g_mainChild < g_pathNodes.length && !g_object.isMoving){
						g_object.targetX = g_nodes[g_pathNodes[g_mainChild ]].x + g_nodeWidth/2;
						g_object.targetY = g_nodes[g_pathNodes[g_mainChild ]].y + g_nodeWidth/2;
						if (g_object.x == g_nodes[g_pathNodes[g_mainChild ]].x + g_nodeWidth/2 && g_object.y == g_nodes[g_pathNodes[g_mainChild ]].y + g_nodeWidth/2){
							g_nodes[g_pathNodes[g_mainChild ]].isPath = true;
							g_mainChild++
						}
					} else if (g_mainChild == g_pathNodes.length){
						if (g_object.x != g_nodes[g_endingNode].x + g_nodeWidth/2 || g_object.targetY != g_nodes[g_endingNode].y + g_nodeWidth/2){
							g_object.targetX = g_nodes[g_endingNode].x + g_nodeWidth/2;
							g_object.targetY = g_nodes[g_endingNode].y + g_nodeWidth/2;
						} else {
							g_object.isDone = true;
							g_reachedHome = true;
						}
						
					}
					
				} 
				
				g_object.m_move();
			} 
		}
		
		function f_frameCounter(){
			// increment seconds
			g_frameCount++;
			/**
			if (g_frameCount >= g_FPS){
				g_timePassed++
				g_frameCount = 0;
			}
			**/
		}
		
		// ---------------------------------- [HTML Stuffs] -----------------------------------
		
		
		function f_manageInputs(){
			if (g_nodeWidth != parseInt(g_nodeSizeinp.value)){
				f_init(parseInt(g_nodeSizeinp.value));
			}
			g_animSpeed     = g_animSpeedinp.value;
			g_showdbginfo   = g_dbgInfoinp.checked;
			g_heuristic     = g_heuristicinp.value;
			g_allowDiagonal = g_diagnoalinp.checked;
			g_asv.innerHTML = "[ " + g_animSpeed + " ]";
			g_adv.innerHTML = "[ " + g_allowDiagonal + " ]";
			g_nsv.innerHTML = "[ " + g_nodeWidth + " ]";
			g_dv.innerHTML  = "[ " + g_showdbginfo + " ]";
			g_dv.innerHTML  = "[ " + g_showdbginfo + " ]";
		}
		
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
		
		/*-----------------------------------------------------------------------------------*\
		|*                            EVENT LISTENERS & HANDLERS                              |
		\*-----------------------------------------------------------------------------------*/
		g_myCanvas.addEventListener('click', (l_event) => {
			// handle clicks
			g_mouseX    = l_event.clientX - g_myCanvas.getBoundingClientRect().x
			g_mouseY    = l_event.clientY - g_myCanvas.getBoundingClientRect().y
			g_clickType = "left";
		})
		
		g_myCanvas.addEventListener('contextmenu', (l_event) => {
			// handle clicks
			g_mouseX    = l_event.clientX - g_myCanvas.getBoundingClientRect().x
			g_mouseY    = l_event.clientY - g_myCanvas.getBoundingClientRect().y
			g_clickType = "right";
			l_event.preventDefault();
		})
		
		document.addEventListener('keydown', (l_event) => {
			if (l_event.key.toLowerCase() == 's'){
				g_currentKey = 's'; // start node
			} else if (l_event.key.toLowerCase() == 'e'){
				g_currentKey = 'e'; // end node
			} else if (l_event.key.toLowerCase() == 'd'){
				g_currentKey = 'o'; // obstacle
			} else if (l_event.keyCode == '37'){
				// left key... select previous
				g_currentKey = 'left';
			} else if (l_event.keyCode == '39'){
				// right key.. select next
				g_currentKey = 'right';
			} else if (l_event.keyCode == 38){
				g_currentKey = 'up';
			} else if (l_event.keyCode == 40){
				g_currentKey = 'down';
			} else if (l_event.key == ' '){
				g_startSorting = true;
			}
		})
		
		/*-----------------------------------------------------------------------------------*\
		|*                           GAME LOOP & Other init functions                         |
		\*-----------------------------------------------------------------------------------*/
		
		function f_gameLoop(){
			f_manageInputs();
			f_frameCounter();
			f_checkClick();
			f_checkKeys();
			f_findPath();
			f_TracePath();
			f_clearCanvas();
			f_drawObjects();
			f_drawSelector();
			f_endDrawings();
		}
		
		function f_resetSearch(){
			// reset flags
			g_mainChild = g_selectedNode = g_currentNode = undefined;
			g_pathNodes = [];
			g_openList = [];
			g_closedList = [];
			g_neighbours = [];
			g_isDone = g_pathFound = g_reachedHome = g_startSorting = false;
			
			// reset some properties of nodes
			for (var i=0; i<g_numNodes; i++){
				g_nodes[i].isNeighbour = g_nodes[i].isClosed = g_nodes[i].isScanned = g_nodes[i].isPath = g_nodes[i].isCurrent = false;
				g_nodes[i].parent = g_nodes[i].h = g_nodes[i].g = g_nodes[i].f = undefined;
			}
			
			// reset the object's x/y co-ordinates and some flag
			g_object.isMoving = g_object.isDone = false;
			g_object.x = g_object.targetX = g_nodes[g_startingNode].x + g_nodeWidth/2;
			g_object.y = g_object.targetY = g_nodes[g_startingNode].y + g_nodeWidth/2;
		}
			
		function f_init(l_nodew){
			g_nodeWidth     = l_nodew || 40;                                         
			g_numRows       = parseInt(g_myCanvas.height/g_nodeWidth -1); 
			g_numColumns    = parseInt(g_myCanvas.width/g_nodeWidth -1);  
			g_numNodes      = g_numRows * g_numColumns;                   
			g_FPS           = 30;                                         
			g_timeInterval  = 1000/g_FPS;                                 
			g_nodes         = new Array(g_numNodes);                      
			g_mouseX        = undefined;                                  
			g_mouseY        = undefined;                                  
			g_clickType     = undefined;                                  
			g_currentKey    = undefined;                                  
			g_selectedNode  = undefined;                                  
			g_selectorWidth = 5;                                          
			g_startingNode  = undefined;                                  
			g_endingNode    = undefined;                                  
			g_openList      = [];                                         
			g_closedList    = [];                                         
			g_pathFound     = false;                                      
			g_startSorting  = false;                                      
			g_mainChild     = undefined;                                  
			g_isDone        = false;                                      
			g_frameCount    = 0;                                          
			g_timePassed    = 0;                                          
			g_pathNodes     = [];                                         
			g_currentNode   = undefined;                                  
			g_neighbours    = []; 
			g_animSpeed     = 4                                           
			g_showdbginfo   = true                                        
			g_heuristic     = 'm'                                         
			g_allowDiagonal = false                                       
			g_reachedHome   = false 
			f_generateNodes();
		}
		
		f_init()
		var g_gameLoop = setInterval(f_gameLoop, g_timeInterval)