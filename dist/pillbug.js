var t=document,e=function(){this._nested_=[]};e.prototype.mount=function(t,e,n){var i=new t(this,n);u(e,i.root),this._nested_.push(i)},e.prototype.update=function(){this._nested_.forEach(function(t){return t.update()})};var n=function(t,e,n,i){var r=this;r.app=t,r.obj=e,r.seq=n,r.parent=i,r.root=void 0,r._nested_=[],r._named_={},r._watches_={},r._previous_={},r._args_=[r.app,r.box.bind(r),r.build.bind(r),r.el.bind(r),r.h.bind(r),r.obj,r.seq,r.watch.bind(r)],r.init.apply(r,r._args_)};n.prototype.as=function(t){return this.parent._saveAs_(this,t),this},n.prototype.build=function(t,e,n){return this.root=this.h(t,e,n)},n.prototype.box=function(t,e,n){var i=new t(this.app,e,void 0,this);return n&&this._saveAs_(i,n),this._nested_.push(i),i},n.prototype.el=function(t){return this._named_[t]},n.prototype.h=function(e,n,r){c(r)&&(r=n,n={});var s=function(e,n,r,s){var o,u,h,p;return u=(o=e.trim().split(" "))[0],h=o.slice(1),p=new i(t.createElement(u),s),h.forEach(function(t){return t.startsWith("#")?p.att("id",t.slice(1)):p.clsAdd(t)}),p.atts(n),c(r)||p.inner(r),p}(e,n,r,this);return this._saveAs_(s,e.split(" ")[0]),s},n.prototype.update=function(t){c(t)||(this.obj=t),this._update_(this._args_)},n.prototype.watch=function(t,e){return this._watches_.hasOwnProperty(t)||(this._watches_[t]=[]),this._watches_[t].push(e),this},n.prototype._saveAs_=function(t,e){this._named_[e]=t},n.prototype._update_=function(){this._updateWatches_(),this._nested_.forEach(function(t){return t.update()})},n.prototype._updateWatches_=function(){var t,e,n;for(t in this._watches_)e=p(this,t),(n=this._previous_[t])!==e&&this._watches_[t].forEach(function(t){t(e,n)}),this._previous_[t]=e};var i=function(t,e){this.e=t,this._c=null,this.view=e},r={Value:{configurable:!0}};r.Value.get=function(){return this.e.value},i.prototype.as=function(t){return this.view._saveAs_(this,t),this},i.prototype.att=function(t,e){return this.e.setAttribute(t,e),this},i.prototype.atts=function(t){for(var e in t)this.att(e,t[e]);return this},i.prototype.checked=function(t){return this.e.checked=t,this},i.prototype.href=function(t){return this.att("href",t)},i.prototype.id=function(t){return this.att("id",t)},i.prototype.src=function(t){return this.att("src",t)},i.prototype.value=function(t){return this.att("value",t)},i.prototype.text=function(t){return this.e.textContent=t,this},i.prototype.child=function(t){return this.e.appendChild(this._ge(t)),this},i.prototype.clear=function(){return this.e.innerHTML="",this.e.textContent="",this.e.value="",this},i.prototype.cls=function(t){return this.e.className=t,this},i.prototype.clsAdd=function(t){return this.e.classList.add(t),this},i.prototype.clsAddTrans=function(t){var e=this;return this.transition(function(n){return e.e.classList.add(t)})},i.prototype.clsRemove=function(t){return this.e.classList.remove(t),this},i.prototype.clsRemoveTrans=function(t){var e=this;return this.transition(function(n){return e.e.classList.remove(t)})},i.prototype.clsToggle=function(t){return this.e.classList.toggle(t),this},i.prototype.f=function(t,e){var n,i,r=this,s=t.split(":");if(1===s.length)n=s[0],i=function(t,n){return e(t,n,r)};else{var o=s[0];n=s[1],i=c(e)?function(t){return r[o](t)}:function(t,n){return r[o](e(t,n,r))}}return this.view.watch(n,i),this},i.prototype.html=function(t){return this.e.innerHTML=t,this},i.prototype.inner=function(t){var e,n=this;return Array.isArray(t)||(t=[t]),this._c?(this._c.reset(),e=function(t){return n._c.getEl(t).root.e}):e=this._ge,this._si(t,e)},i.prototype.on=function(t,e){var n=this;return this.e.addEventListener(t,function(t){return e(t,n)}),this},i.prototype.transition=function(t){var e=this;return new Promise(function(n){t();var i=function(t){e.e.removeEventListener("transitionend",i),n()};e.e.addEventListener("transitionend",i)})},i.prototype.use=function(t,e){return this._c=new s(this.view.app,t,e,this.view),this},i.prototype._si=function(t,e){var n=this;return this.clear(),t.forEach(function(t){n.e.appendChild(e(t))}),this},i.prototype._ge=function(e){return e instanceof i?e.e:e instanceof n?e.root.e:e instanceof Node?e:t.createTextNode(e.toString())},Object.defineProperties(i.prototype,r);var s=function(t,e,n,i){this._a=t,this._v=i,this._vc=e,this._c={},this._k=n,this._seq=0,c(n)?this._k=function(t,e){return e}:a(n)&&(this._k=function(t,e){return p(t,n)})};function o(e){return a(e)?t.getElementById(e.slice(1)):e}function u(t,e){var n=o(t);n.parentNode.replaceChild(e.e,n)}s.prototype.reset=function(){this._seq=0},s.prototype.getEl=function(t){var e,n=this._k(t,this._seq);return this._c.hasOwnProperty(n)?e=this._c[n]:(e=new this._vc(this._a,t,this._seq,this._v),this._c[n]=e),e.update(t),this._seq+=1,e};var h=function(t,e){return e.endsWith("()")?t[e.substr(0,e.length-2)].bind(t)():t[e]};function p(t,e){return e.split(".").reduce(h,t)}function c(t){return void 0===t}function a(t){return"string"==typeof t}exports.App=e,exports.View=n,exports.Wrapper=i,exports.transition=function(t,e){return new Promise(function(n){e();var i=function(e){t.removeEventListener("transitionend",i),n()};t.addEventListener("transitionend",i)})},exports.ViewCache=s,exports.getNode=o,exports.bindWrapper=u,exports.getProp=p,exports.und=c,exports.isStr=a;
//# sourceMappingURL=pillbug.js.map
