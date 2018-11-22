/**
 * louui by codelou
 */

 ;
 ! function(){

    var Class = function() {
        this.v = '1.0';
    }
    //返回当前时间的多久前
    Class.prototype.time = function(){

    }

    var louui = new Class();

    'function' === typeof define ? define(function() {
        return louui;
    }) :'underfined' !== typeof exports ? module.exports = louui : window.louui = louui;
 }();