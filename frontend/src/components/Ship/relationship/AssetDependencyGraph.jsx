import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdInfo, MdCheckCircle, MdWarning, MdError, MdVisibility, MdAccountTree } from 'react-icons/md';

const getRiskColor = (rating, isReference = false) => {
  if (isReference) return { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', icon: <MdInfo />, label: 'REFERENCE' };
  if (rating === null) return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', icon: <MdInfo />, label: 'NO DATA' };
  if (rating <= 5) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <MdError />, label: 'CRITICAL' };
  if (rating <= 7) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <MdWarning />, label: 'CAUTION' };
  return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <MdCheckCircle />, label: 'GOOD' };
};

const getEdgeColor = (strength, isReference = false) => {
  if (isReference) return 'stroke-slate-200';
  if (strength === 'high') return 'stroke-red-400';
  if (strength === 'medium') return 'stroke-amber-400';
  return 'stroke-slate-300';
};

const computeLayout = (nodesData, linksData, dimensions) => {
  if (!nodesData || nodesData.length === 0 || dimensions.width === 0) return null;

  const nodes = nodesData.map(n => ({ ...n }));
  const links = linksData.map(l => ({
    ...l,
    sourceId: l.source.id || l.source,
    targetId: l.target.id || l.target
  }));

  const depths = new Map();
  nodes.forEach(n => depths.set(n.id, 0));
  
  for (let i = 0; i < nodes.length; i++) {
    links.forEach(l => {
      const srcDepth = depths.get(l.sourceId);
      const tgtDepth = depths.get(l.targetId);
      if (srcDepth >= tgtDepth) {
        depths.set(l.targetId, srcDepth + 1);
      }
    });
  }

  const columns = [];
  let maxDepth = 0;
  nodes.forEach(n => {
    const d = depths.get(n.id);
    if (d > maxDepth) maxDepth = d;
    if (!columns[d]) columns[d] = [];
    columns[d].push(n);
  });

  const cardWidth = 180;
  const cardHeight = 80;
  const paddingX = Math.max(100, (dimensions.width - ((maxDepth + 1) * cardWidth)) / (maxDepth || 1));
  
  let maxColHeight = 0;
  columns.forEach(colNodes => {
    const h = colNodes.length * cardHeight + (colNodes.length - 1) * 30;
    if (h > maxColHeight) maxColHeight = h;
  });
  const requiredHeight = Math.max(300, maxColHeight + 80); // reduced min height for stacked layouts

  const positionedNodes = new Map();
  
  columns.forEach((colNodes, colIndex) => {
    const x = 40 + colIndex * (cardWidth + paddingX);
    const totalHeightForCol = colNodes.length * cardHeight + (colNodes.length - 1) * 30;
    const startY = (requiredHeight - totalHeightForCol) / 2;

    colNodes.forEach((node, rowIndex) => {
      positionedNodes.set(node.id, {
        ...node,
        x,
        y: startY + rowIndex * (cardHeight + 30),
        width: cardWidth,
        height: cardHeight
      });
    });
  });

  const finalLinks = links.map(l => {
    const src = positionedNodes.get(l.sourceId);
    const tgt = positionedNodes.get(l.targetId);
    return { ...l, sourceNode: src, targetNode: tgt };
  }).filter(l => l.sourceNode && l.targetNode);

  return { nodes: Array.from(positionedNodes.values()), links: finalLinks, maxHeight: requiredHeight };
};

const GraphSection = ({ layout, title, subtitle, icon: Icon, isReference, highestRiskCascade, containerWidth }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const hasInsufficientData = !layout || layout.nodes.length === 0 || (!isReference && layout.links.length === 0);

  if (hasInsufficientData) {
    if (!isReference) {
      return (
        <div className="mb-10">
           <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Icon className={isReference ? "text-slate-400" : "text-blue-600"} /> {title}
            </h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-8 text-center">
            <MdWarning className="text-4xl text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Insufficient Inspection Evidence</h3>
            <p className="text-sm text-slate-600 max-w-md">
              SHIP currently does not have enough inspection observations to establish reliable relationships for this project.
            </p>
            <button className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Explore Available Data
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mb-10">
      <div className="mb-4">
        <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-1 ${isReference ? 'text-slate-500' : 'text-slate-800'}`}>
          <Icon className={isReference ? "text-slate-400" : "text-blue-600"} /> {title}
        </h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      
      <div className={`relative w-full rounded-xl overflow-x-auto overflow-y-hidden border shadow-sm ${isReference ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`} style={{ height: layout.maxHeight }}>
        
        {/* Edges */}
        <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: containerWidth, height: layout.maxHeight }}>
          <defs>
            <marker id={`arrowhead${isReference ? '-ref' : ''}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={isReference ? "#cbd5e1" : "#94a3b8"} />
            </marker>
            <marker id={`arrowhead-red${isReference ? '-ref' : ''}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={isReference ? "#cbd5e1" : "#f87171"} />
            </marker>
            <marker id={`arrowhead-amber${isReference ? '-ref' : ''}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={isReference ? "#cbd5e1" : "#fbbf24"} />
            </marker>
          </defs>
          <AnimatePresence>
            {layout.links.map(link => {
              const isHovered = hoveredNode === link.sourceId || hoveredNode === link.targetId;
              const opacity = hoveredNode ? (isHovered ? 1 : (isReference ? 0.05 : 0.15)) : (isReference ? 0.4 : 0.6);
              const isHighStrength = link.strength === 'high';
              
              const startX = link.sourceNode.x + link.sourceNode.width;
              const startY = link.sourceNode.y + link.sourceNode.height / 2;
              const endX = link.targetNode.x;
              const endY = link.targetNode.y + link.targetNode.height / 2;
              
              const cpX1 = startX + (endX - startX) * 0.5;
              const cpY1 = startY;
              const cpX2 = startX + (endX - startX) * 0.5;
              const cpY2 = endY;

              const d = `M ${startX} ${startY} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endX - 4} ${endY}`;
              
              let marker = `url(#arrowhead${isReference ? '-ref' : ''})`;
              if (isHighStrength) marker = `url(#arrowhead-red${isReference ? '-ref' : ''})`;
              else if (link.strength === 'medium') marker = `url(#arrowhead-amber${isReference ? '-ref' : ''})`;

              return (
                <motion.g key={`${link.sourceId}-${link.targetId}`}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity, pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <path
                    d={d}
                    fill="none"
                    className={`${getEdgeColor(link.strength, isReference)} transition-opacity duration-300`}
                    strokeWidth={isHighStrength ? 3 : (link.strength === 'medium' ? 2 : 1)}
                    markerEnd={marker}
                  />
                  
                  {!isReference && isHighStrength && (
                    <text 
                      x={(startX + endX) / 2} 
                      y={(startY + endY) / 2 - 8}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-red-400 tracking-wider uppercase"
                    >
                      {link.effect}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ width: containerWidth, height: layout.maxHeight }}>
          {layout.nodes.map(node => {
            const status = getRiskColor(node.avgRating, isReference);
            const isHovered = hoveredNode === node.id;
            const opacity = isReference ? (hoveredNode ? (isHovered ? 1 : 0.2) : 0.6) : (hoveredNode ? (isHovered ? 1 : 0.3) : 1);

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`absolute pointer-events-auto flex flex-col bg-white border-2 rounded-lg shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md cursor-default ${status.border} ${isReference ? 'grayscale opacity-75' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height
                }}
              >
                <div className={`px-3 py-1.5 border-b ${status.bg} ${status.border} flex items-center justify-between rounded-t-md`}>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${status.text} flex items-center gap-1`}>
                    {status.icon} {status.label}
                  </span>
                  {!isReference && node.avgRating !== null && (
                    <span className={`font-bold text-xs ${status.text}`}>{node.avgRating} / 10</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center px-4">
                  <span className={`font-bold text-sm leading-tight ${isReference ? 'text-slate-500' : 'text-slate-800'}`}>{node.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {highestRiskCascade && !isReference && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
          <MdWarning className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-900 mb-1">Cascading Failure Warning (Observed)</h4>
            <p className="text-xs text-red-800">
              Actual inspection data confirms that poor performance in <span className="font-black">{highestRiskCascade.sourceNode.label}</span> 
              &nbsp;(Rating: {highestRiskCascade.sourceNode.avgRating}/10) is actively degrading downstream dependent assets like <span className="font-bold">{highestRiskCascade.targetNode.label}</span>. 
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AssetDependencyGraph = ({ data, fullData }) => {
  const containerRef = useRef(null);
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

  const { observedLayout, referenceLayout } = useMemo(() => {
    if (!data || !data.nodes) return { observedLayout: null, referenceLayout: null };

    // 1. Observed Data (Only EVIDENCE_SUPPORTED)
    const observedNodes = data.nodes.filter(n => n.avgRating !== null);
    const observedNodeIds = new Set(observedNodes.map(n => n.id));
    const observedLinks = data.links.filter(l => {
      const srcId = l.source.id || l.source;
      const tgtId = l.target.id || l.target;
      return observedNodeIds.has(srcId) && observedNodeIds.has(tgtId);
    });

    // 2. Reference Data (Everything, treated as structural model)
    const referenceNodes = data.nodes;
    const referenceLinks = data.links;

    return {
      observedLayout: computeLayout(observedNodes, observedLinks, dimensions),
      referenceLayout: computeLayout(referenceNodes, referenceLinks, dimensions)
    };
  }, [data, dimensions]);

  let highestRiskCascade = null;
  if (observedLayout) {
    const criticalLinks = observedLayout.links.filter(l => l.sourceNode.avgRating !== null && l.sourceNode.avgRating <= 5);
    if (criticalLinks.length > 0) {
      highestRiskCascade = criticalLinks.sort((a, b) => b.sourceNode.avgRating - a.sourceNode.avgRating)[0];
    }
  }

  return (
    <div className="flex flex-col h-full w-full" ref={containerRef}>
      <GraphSection 
        title="OBSERVED RELATIONSHIPS"
        subtitle="Relationships derived from actual inspection observations."
        icon={MdVisibility}
        layout={observedLayout}
        isReference={false}
        highestRiskCascade={highestRiskCascade}
        containerWidth={dimensions.width}
      />

      <GraphSection 
        title="INFRASTRUCTURE DEPENDENCIES"
        subtitle="Reference relationships configured by the infrastructure model. These are not conclusions derived from current inspection data."
        icon={MdAccountTree}
        layout={referenceLayout}
        isReference={true}
        highestRiskCascade={null}
        containerWidth={dimensions.width}
      />
    </div>
  );
};

export default AssetDependencyGraph;
