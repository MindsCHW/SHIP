import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdWarning, 
  MdInfo,
  MdLayers,
  MdTimeline,
  MdClose,
  MdKeyboardArrowRight
} from 'react-icons/md';

const getCategoryIcon = (name) => {
  return <MdLayers />;
};

const getStatusColor = (val, isNode = true) => {
  if (val > 10) return isNode ? 'bg-red-50 text-red-700 border-red-200' : 'stroke-red-400';
  if (val > 5) return isNode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'stroke-amber-400';
  return isNode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'stroke-emerald-400';
};

const getEdgeThickness = (weight) => {
  if (weight >= 5) return 4;
  if (weight >= 3) return 2;
  return 1;
};

const CategoryRelationshipMap = ({ data, fullData }) => {
  const containerRef = useRef(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setDimensions({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const coverageData = useMemo(() => {
    if (!data || !data.nodes || !fullData) return { total: 0, evidence: 0, noEvidence: 0, noEvidenceNodes: [] };
    let evidenceCount = 0;
    const noEvNodes = [];
    data.nodes.forEach(node => {
      const healthCat = fullData.projectHealth?.find(c => c.name === node.id);
      if (healthCat && healthCat.averageRating !== null) {
        evidenceCount++;
      } else {
        noEvNodes.push(node);
      }
    });
    return {
      total: data.nodes.length,
      evidence: evidenceCount,
      noEvidence: data.nodes.length - evidenceCount,
      noEvidenceNodes: noEvNodes
    };
  }, [data, fullData]);

  const layout = useMemo(() => {
    if (!data || !data.nodes || data.nodes.length === 0 || dimensions.width === 0) return null;

    // Filter nodes for EVIDENCE_SUPPORTED
    const observedNodes = data.nodes.filter(node => {
      const healthCat = fullData?.projectHealth?.find(c => c.name === node.id);
      return healthCat && healthCat.averageRating !== null;
    });

    if (observedNodes.length < 2) return null; // Insufficient data for a graph

    const nodes = [...observedNodes].sort((a, b) => b.val - a.val);
    const observedNodeIds = new Set(nodes.map(n => n.id));
    
    // Filter links to only observed nodes
    const links = data.links.filter(l => {
      const srcId = l.source.id || l.source;
      const tgtId = l.target.id || l.target;
      return observedNodeIds.has(srcId) && observedNodeIds.has(tgtId);
    });

    const primaryNode = nodes[0];
    const secondaryNodes = nodes.slice(1);

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Adjust center if panel is open (shift left)
    const effectiveCenterX = selectedNodeId ? centerX - 160 : centerX;
    
    const radius = Math.min(effectiveCenterX, centerY) * 0.65;

    const positionedNodes = new Map();
    
    positionedNodes.set(primaryNode.id, {
      ...primaryNode,
      x: effectiveCenterX,
      y: centerY,
      isPrimary: true
    });

    secondaryNodes.forEach((node, index) => {
      const angle = (index / secondaryNodes.length) * 2 * Math.PI - Math.PI / 2; // Start top
      positionedNodes.set(node.id, {
        ...node,
        x: effectiveCenterX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        isPrimary: false
      });
    });

    return {
      nodes: Array.from(positionedNodes.values()),
      links: links.map(link => {
        const source = positionedNodes.get(link.source.id || link.source);
        const target = positionedNodes.get(link.target.id || link.target);
        return { ...link, sourceNode: source, targetNode: target };
      }).filter(l => l.sourceNode && l.targetNode)
    };
  }, [data, dimensions, selectedNodeId, fullData]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-gray-500 bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-8 text-center">
        <MdWarning className="text-4xl text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Insufficient Inspection Evidence</h3>
        <p className="text-sm text-slate-600 max-w-md">
          SHIP currently does not have enough inspection observations to establish reliable relationships for this project.
        </p>
      </div>
    );
  }
  
  if (coverageData.total > 0 && (!layout || layout.nodes.length < 2)) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-gray-500 bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-8 text-center">
        <MdWarning className="text-4xl text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Insufficient Inspection Evidence</h3>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          SHIP requires actual inspection data from at least two categories to establish reliable intelligence relationships. Currently, {coverageData.noEvidence} categories lack sufficient data.
        </p>
        <div className="flex gap-6 text-sm border-t border-slate-200 pt-6 mt-2">
          <div><span className="font-bold text-slate-700">{coverageData.total}</span> Categories</div>
          <div><span className="font-bold text-emerald-600">{coverageData.evidence}</span> Observed</div>
          <div><span className="font-bold text-amber-600">{coverageData.noEvidence}</span> Awaiting Data</div>
        </div>
      </div>
    );
  }

  const selectedNodeData = layout?.nodes.find(n => n.id === selectedNodeId);
  const connectedNodeIds = new Set();
  let strongestLink = null;
  let maxWeight = 0;

  if (selectedNodeId && layout) {
    connectedNodeIds.add(selectedNodeId);
    layout.links.forEach(link => {
      if (link.sourceNode.id === selectedNodeId || link.targetNode.id === selectedNodeId) {
        connectedNodeIds.add(link.sourceNode.id);
        connectedNodeIds.add(link.targetNode.id);
        if (link.value > maxWeight) {
          maxWeight = link.value;
          strongestLink = link;
        }
      }
    });
  }

  // Panel Intelligence Extraction
  const getPanelData = (nodeId) => {
    if (!fullData || !nodeId) return null;
    
    // Average Rating
    let avgRating = 'N/A';
    if (fullData.projectDNA?.totalCategories) { // It's an array somewhere? No, projectDNA has bestPerforming etc, maybe need to search projectHealth?
      const healthCat = fullData.projectHealth?.find(c => c.name === nodeId);
      if (healthCat) avgRating = healthCat.averageRating;
    }

    // Top Hotspots
    const hotspots = fullData.chainageHotspots?.filter(h => h.categories.includes(nodeId)).slice(0, 3) || [];

    return { avgRating, hotspots };
  };

  const panelData = getPanelData(selectedNodeId);
  const strongestRelName = strongestLink 
    ? (strongestLink.sourceNode.id === selectedNodeId ? strongestLink.targetNode.id : strongestLink.sourceNode.id)
    : 'None';

  return (
    <div className="relative w-full h-[600px] bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex" ref={containerRef}>
      
      {/* Data Coverage Panel */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-4 w-64 pointer-events-auto">
        <h4 className="text-xs font-black tracking-widest text-slate-800 uppercase mb-3 flex items-center gap-1.5">
          <MdInfo className="text-blue-500 text-base" /> Data Coverage
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Categories Available</span>
            <span className="font-bold text-slate-800">{coverageData.total}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-700">
            <span>Sufficient Evidence</span>
            <span className="font-bold">{coverageData.evidence}</span>
          </div>
          <div className="flex justify-between items-center text-amber-600">
            <span>Awaiting Inspection</span>
            <span className="font-bold">{coverageData.noEvidence}</span>
          </div>
        </div>
        {coverageData.noEvidence > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors w-full text-left">
              View Data Gaps →
            </button>
          </div>
        )}
      </div>

      {/* SVG Edges Layer */}
      {layout && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <AnimatePresence>
            {layout.links.map((link, i) => {
              const isConnected = selectedNodeId ? 
                (link.sourceNode.id === selectedNodeId || link.targetNode.id === selectedNodeId) : true;
              
              const isMuted = selectedNodeId && !isConnected;
              const isStrong = link.value >= 5;

              // Quadratic curve control point slightly offset
              const midX = (link.sourceNode.x + link.targetNode.x) / 2;
              const midY = (link.sourceNode.y + link.targetNode.y) / 2;
              const dx = link.targetNode.x - link.sourceNode.x;
              const dy = link.targetNode.y - link.sourceNode.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const cx = midX - (dy * 0.15);
              const cy = midY + (dx * 0.15);

              const d = `M ${link.sourceNode.x} ${link.sourceNode.y} Q ${cx} ${cy} ${link.targetNode.x} ${link.targetNode.y}`;

              return (
                <motion.g key={`${link.sourceNode.id}-${link.targetNode.id}`}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: isMuted ? 0.1 : (isConnected ? 1 : 0.4), pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <path
                    d={d}
                    fill="none"
                    stroke={isConnected && isStrong ? 'url(#grad)' : getStatusColor(link.value, false).replace('stroke-', '')} // we can just use simple colors
                    className={`${getStatusColor(link.value, false)} transition-all duration-500`}
                    strokeWidth={getEdgeThickness(link.value)}
                    strokeLinecap="round"
                    filter={isConnected && isStrong ? 'url(#glow)' : ''}
                  />
                  {/* Subtle animation for strong links */}
                  {isConnected && isStrong && (
                    <circle r="3" fill="#fff" filter="url(#glow)">
                      <animateMotion dur="3s" repeatCount="indefinite" path={d} />
                    </circle>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      )}

      {/* HTML Nodes Layer */}
      {layout && (
        <div className="absolute inset-0 z-10">
          <AnimatePresence>
            {layout.nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnected = selectedNodeId ? connectedNodeIds.has(node.id) : true;
              const isMuted = selectedNodeId && !isConnected;
              
              const nodeSize = node.isPrimary ? (isSelected ? 110 : 100) : (isSelected ? 80 : 70);

              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    x: node.x - nodeSize/2, 
                    y: node.y - nodeSize/2,
                    scale: isMuted ? 0.8 : 1,
                    opacity: isMuted ? 0.3 : 1
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                  className={`absolute rounded-full flex flex-col items-center justify-center cursor-pointer shadow-lg border-2 transition-colors ${getStatusColor(node.val, true)} ${isSelected ? 'ring-4 ring-offset-2 ring-green-500 shadow-green-200' : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'}`}
                  style={{ width: nodeSize, height: nodeSize }}
                >
                  <div className="text-2xl mb-0.5 opacity-80">{getCategoryIcon(node.id)}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight px-2">{node.label}</div>
                  {node.isPrimary && (
                    <div className="absolute -bottom-3 bg-white px-2 py-0.5 rounded-full border shadow text-[10px] font-black tracking-widest text-slate-800">
                      PRIMARY
                    </div>
                  )}
                  {isSelected && (
                    <motion.div 
                      layoutId="outline"
                      className="absolute -inset-1 rounded-full border border-green-500/30"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Right Intelligence Panel */}
      <AnimatePresence>
        {selectedNodeId && selectedNodeData && panelData && (
          <motion.div 
            initial={{ x: 350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 350, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-4 right-4 bottom-4 w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Intelligence Focus</div>
                <h3 className="text-xl font-black text-slate-800">{selectedNodeData.label}</h3>
              </div>
              <button onClick={() => setSelectedNodeId(null)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <MdClose />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Critical Chainages</div>
                  <div className="text-2xl font-black text-slate-800">{selectedNodeData.val}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Rating</div>
                  <div className="text-2xl font-black text-slate-800">{panelData.avgRating}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <MdTimeline /> Strongest Relationship
                </div>
                <div className="p-3 bg-blue-50 text-blue-900 border border-blue-100 rounded-lg font-semibold flex items-center justify-between">
                  {strongestRelName}
                  <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">{maxWeight} co-occurrences</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <MdWarning /> Associated Hotspots
                </div>
                {panelData.hotspots.length > 0 ? (
                  <div className="space-y-2">
                    {panelData.hotspots.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                        <span className="font-semibold text-slate-700">CH {h.chainage}</span>
                        <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">{h.criticalCount} issues</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">No associated hotspots found.</div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-1">
                Explore Chainages <MdKeyboardArrowRight />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Default Instruction */}
      {!selectedNodeId && (
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-2">
            <MdInfo className="text-blue-500 text-base" /> Click any category node to explore relationships
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryRelationshipMap;
