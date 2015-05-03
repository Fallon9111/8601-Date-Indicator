/* 8601 Date Indicator
 *
 * gnome-shell extension that indicates ISO 8601 Date in status area.
 * Based on Gniourf's Uptime extension as original code template:
 *    https://extensions.gnome.org/extension/508/uptime-indicator/
 *
 * Author: James Fallon, j.fallon1997@gmail.com
 * Date: 2015-05-03
 *
 */

const PanelMenu=imports.ui.panelMenu;
const St=imports.gi.St;
const Main=imports.ui.main;
const Shell=imports.gi.Shell;
const Mainloop=imports.mainloop;
const Lang=imports.lang;
const PopupMenu=imports.ui.popupMenu;
const Clutter=imports.gi.Clutter;

let _8601date_indicator_object=null;

const 8601DateIndicator=new Lang.Class(
{
   Name: '8601DateIndicator.8601DateIndicator',
   Extends: PanelMenu.Button,
   buttonText: null,
   _timeout: null,
   _refresh_rate: 1,
   _change_timeout_loop: false,
   _started: null,

   _init: function()
   {
      this.parent(0.0,"8601 Date Indicator",false);

      this.buttonText=new St.Label({
         name: "8601-date-indicator-buttonText",
         y_align: Clutter.ActorAlign.CENTER
      });
      this.actor.add_actor(this.buttonText);

      this._mymenutitle=new PopupMenu.PopupMenuItem(this._started, { reactive: false });
      this.menu.addMenuItem(this._mymenutitle);

      this.actor.connect('button-press-event', Lang.bind(this, this._refresh));
      this.actor.connect('key-press-event', Lang.bind(this, this._refresh));

      this._set_refresh_rate(1)
      this._change_timeoutloop=true;
      this._timeout=null;
      this._refresh();
   },

   _refresh: function()
   {
      let text=this._update_8601date();
      this.buttonText.set_text(text)
      if(this._change_timeoutloop) {
         this._remove_timeout();
         this._timeout=Mainloop.timeout_add_seconds(this._refresh_rate,Lang.bind(this, this._refresh));
         this._change_timeoutloop=false;
         return false;
      }
      return true;
   },

   _set_refresh_rate: function(refresh_rate)
   {
      if(this._refresh_rate!=refresh_rate) {
         this._refresh_rate=refresh_rate;
         this._change_timeoutloop=true;
      }
   },

   _remove_timeout: function()
   {
      if(this._timeout) {
         Mainloop.source_remove(this._timeout);
         this._timeout=null;
      }
   },

   _update_8601date: function()
   {
      let label_text=new Date().toJSON();
      return label_text;
   },

   destroy: function()
   {
      this._remove_timeout();
      this.parent();
   }
});

// Init function
function init(metadata)
{
}

// Enable function
function enable()
{
   _8601date_indicator_object=new 8601DateIndicator;
   if(_8601date_indicator_object) {
      Main.panel.addToStatusArea('8601-date-indicator',_8601date_indicator_object);
   }
}

// Disable function
function disable()
{
   if(_8601date_indicator_object) {
      _8601date_indicator_object.destroy();
      _8601date_indicator_object=null;
   }
}

