function ProjectedOverlay(map,imageUrl,bounds,opts){google.maps.OverlayView.call(this),this.map_=map,this.url_=imageUrl,this.bounds_=bounds,this.addZ_=opts.addZoom||"",this.id_=opts.id||this.url_,this.percentOpacity_=opts.percentOpacity||50,this.setMap(map)}ProjectedOverlay.prototype=new google.maps.OverlayView,ProjectedOverlay.prototype.createElement=function(){var panes=this.getPanes(),div=this.div_;div||(div=this.div_=document.createElement("div"),div.style.position="absolute",div.setAttribute("id",this.id_),this.div_=div,this.lastZoom_=-1,this.percentOpacity_&&this.setOpacity(this.percentOpacity_),panes.overlayLayer.appendChild(div))},ProjectedOverlay.prototype.remove=function(){this.div_&&(this.div_.parentNode.removeChild(this.div_),this.div_=null,this.setMap(null))},ProjectedOverlay.prototype.draw=function(){if(this.createElement(),this.div_){var c1=this.get("projection").fromLatLngToDivPixel(this.bounds_.getSouthWest()),c2=this.get("projection").fromLatLngToDivPixel(this.bounds_.getNorthEast());if(c1&&c2&&(this.div_.style.width=Math.abs(c2.x-c1.x)+"px",this.div_.style.height=Math.abs(c2.y-c1.y)+"px",this.div_.style.left=Math.min(c2.x,c1.x)+"px",this.div_.style.top=Math.min(c2.y,c1.y)+"px",this.lastZoom_!=this.map_.getZoom())){this.lastZoom_=this.map_.getZoom();var url=this.url_;this.addZ_&&(url+=this.addZ_+this.map_.getZoom()),this.div_.innerHTML='<img src="'+url+'"  width='+this.div_.style.width+" height="+this.div_.style.height+" >"}}},ProjectedOverlay.prototype.setOpacity=function(opacity){0>opacity&&(opacity=0),opacity>100&&(opacity=100);var c=opacity/100;"string"==typeof this.div_.style.filter&&(this.div_.style.filter="alpha(opacity:"+opacity+")"),"string"==typeof this.div_.style.KHTMLOpacity&&(this.div_.style.KHTMLOpacity=c),"string"==typeof this.div_.style.MozOpacity&&(this.div_.style.MozOpacity=c),"string"==typeof this.div_.style.opacity&&(this.div_.style.opacity=c)};