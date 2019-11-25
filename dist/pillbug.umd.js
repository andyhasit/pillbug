!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e(t.pillbugJs={})}(this,function(t){var e=document,n=function(){this._nested_=[]};n.prototype.mount=function(t,e,n){var i=new t(this,n);h(e,i.root),this._nested_.push(i)},n.prototype.update=function(){this._nested_.forEach(function(t){return t.update()})};var i=function(t,e,n,i){var r=this;r.app=t,r.obj=e,r.seq=n,r.parent=i,r.root=void 0,r._nested_=[],r._named_={},r._watches_={},r._previous_={},r._args_=[r.app,r.box.bind(r),r.build.bind(r),r.el.bind(r),r.h.bind(r),r.obj,r.seq,r.watch.bind(r)],r.init.apply(r,r._args_)};i.prototype.as=function(t){return this.parent._saveAs_(this,t),this},i.prototype.build=function(t,e,n){return this.root=this.h(t,e,n)},i.prototype.box=function(t,e,n){var i=new t(this.app,e,void 0,this);return n&&this._saveAs_(i,n),this._nested_.push(i),i},i.prototype.el=function(t){return this._named_[t]},i.prototype.h=function(t,n,i){a(i)&&(i=n,n={});var s=function(t,n,i,s){var o,u,h,c;return u=(o=t.trim().split(" "))[0],h=o.slice(1),c=new r(e.createElement(u),s),h.forEach(function(t){return t.startsWith("#")?c.att("id",t.slice(1)):c.clsAdd(t)}),c.atts(n),a(i)||c.inner(i),c}(t,n,i,this);return this._saveAs_(s,t.split(" ")[0]),s},i.prototype.update=function(t){a(t)||(this.obj=t),this._update_(this._args_)},i.prototype.watch=function(t,e){return this._watches_.hasOwnProperty(t)||(this._watches_[t]=[]),this._watches_[t].push(e),this},i.prototype._saveAs_=function(t,e){this._named_[e]=t},i.prototype._update_=function(){this._updateWatches_(),this._nested_.forEach(function(t){return t.update()})},i.prototype._updateWatches_=function(){var t,e,n;for(t in this._watches_)e=p(this,t),(n=this._previous_[t])!==e&&this._watches_[t].forEach(function(t){t(e,n)}),this._previous_[t]=e};var r=function(t,e){this.e=t,this._c=null,this.view=e},s={Value:{configurable:!0}};s.Value.get=function(){return this.e.value},r.prototype.as=function(t){return this.view._saveAs_(this,t),this},r.prototype.att=function(t,e){return this.e.setAttribute(t,e),this},r.prototype.atts=function(t){for(var e in t)this.att(e,t[e]);return this},r.prototype.checked=function(t){return this.e.checked=t,this},r.prototype.href=function(t){return this.att("href",t)},r.prototype.id=function(t){return this.att("id",t)},r.prototype.src=function(t){return this.att("src",t)},r.prototype.value=function(t){return this.att("value",t)},r.prototype.text=function(t){return this.e.textContent=t,this},r.prototype.child=function(t){return this.e.appendChild(this._ge(t)),this},r.prototype.clear=function(){return this.e.innerHTML="",this.e.textContent="",this.e.value="",this},r.prototype.cls=function(t){return this.e.className=t,this},r.prototype.clsAdd=function(t){return this.e.classList.add(t),this},r.prototype.clsAddTrans=function(t){var e=this;return this.transition(function(n){return e.e.classList.add(t)})},r.prototype.clsRemove=function(t){return this.e.classList.remove(t),this},r.prototype.clsRemoveTrans=function(t){var e=this;return this.transition(function(n){return e.e.classList.remove(t)})},r.prototype.clsToggle=function(t){return this.e.classList.toggle(t),this},r.prototype.f=function(t,e){var n,i,r=this,s=t.split(":");if(1===s.length)n=s[0],i=function(t,n){return e(t,n,r)};else{var o=s[0];n=s[1],i=a(e)?function(t){return r[o](t)}:function(t,n){return r[o](e(t,n,r))}}return this.view.watch(n,i),this},r.prototype.html=function(t){return this.e.innerHTML=t,this},r.prototype.inner=function(t){var e,n=this;return Array.isArray(t)||(t=[t]),this._c?(this._c.reset(),e=function(t){return n._c.getEl(t).root.e}):e=this._ge,this._si(t,e)},r.prototype.on=function(t,e){var n=this;return this.e.addEventListener(t,function(t){return e(t,n)}),this},r.prototype.transition=function(t){var e=this;return new Promise(function(n){t();var i=function(t){e.e.removeEventListener("transitionend",i),n()};e.e.addEventListener("transitionend",i)})},r.prototype.use=function(t,e){return this._c=new o(this.view.app,t,e,this.view),this},r.prototype._si=function(t,e){var n=this;return this.clear(),t.forEach(function(t){n.e.appendChild(e(t))}),this},r.prototype._ge=function(t){return t instanceof r?t.e:t instanceof i?t.root.e:t instanceof Node?t:e.createTextNode(t.toString())},Object.defineProperties(r.prototype,s);var o=function(t,e,n,i){this._a=t,this._v=i,this._vc=e,this._c={},this._k=n,this._seq=0,a(n)?this._k=function(t,e){return e}:f(n)&&(this._k=function(t,e){return p(t,n)})};function u(t){return f(t)?e.getElementById(t.slice(1)):t}function h(t,e){var n=u(t);n.parentNode.replaceChild(e.e,n)}o.prototype.reset=function(){this._seq=0},o.prototype.getEl=function(t){var e,n=this._k(t,this._seq);return this._c.hasOwnProperty(n)?e=this._c[n]:(e=new this._vc(this._a,t,this._seq,this._v),this._c[n]=e),e.update(t),this._seq+=1,e};var c=function(t,e){return e.endsWith("()")?t[e.substr(0,e.length-2)].bind(t)():t[e]};function p(t,e){return e.split(".").reduce(c,t)}function a(t){return void 0===t}function f(t){return"string"==typeof t}t.App=n,t.View=i,t.Wrapper=r,t.transition=function(t,e){return new Promise(function(n){e();var i=function(e){t.removeEventListener("transitionend",i),n()};t.addEventListener("transitionend",i)})},t.ViewCache=o,t.getNode=u,t.bindWrapper=h,t.getProp=p,t.und=a,t.isStr=f});
//# sourceMappingURL=pillbug.umd.js.map