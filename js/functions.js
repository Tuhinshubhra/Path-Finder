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