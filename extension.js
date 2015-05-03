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
      this.parent(0.0,"8601Date Indicator",false);

      this.buttonText=new St.Label({
         name: "8601date-indicator-buttonText",
         y_align: Clutter.ActorAlign.CENTER
      });
      this.actor.add_actor(this.buttonText);

      /* Find starting date and */
      let timestamp=this._get_timestamps()[0];
      let date=new Date();
      date.setTime(date-timestamp*1000)
      this._started=date.toLocaleString();
      /* and prepare menu */
      this._mymenutitle=new PopupMenu.PopupMenuItem(this._started, { reactive: false });
      this.menu.addMenuItem(this._mymenutitle);

      this.actor.connect('button-press-event', Lang.bind(this, this._refresh));
      this.actor.connect('key-press-event', Lang.bind(this, this._refresh));

      this._set_refresh_rate(1)
      this._change_timeoutloop=true;
      this._timeout=null;
      this._refresh();
   },

   _get_timestamps: function()
   {
      return Shell.get_file_contents_utf8_sync('/proc/8601date').split(" ");
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
      let timestamps_s=this._get_timestamps()[0];
      let minutes=Math.floor((timestamps_s/60)%60);
      let hours=Math.floor((timestamps_s/3600)%24);
      let days=Math.floor((timestamps_s/86400)%365);
      let years=Math.floor(timestamps_s/31536000);
      let label_text="?";
      if(years>0) {
         label_text=years+"Y"+days+"D";
         /* Come back next year */
         this._set_refresh_rate(31536000-(timestamps_s)%31536000);
      }
      else if(days>99) {
         label_text=days+"D";
         /* Come back next day */
         this._set_refresh_rate(86400-(timestamps_s%86400))
      }
      else if(days>0) {
         if(hours < 10) {
            hours="0" + hours;
         }
         label_text=days+"D"+hours+"h";
         /* Come back next hour */
         this._set_refresh_rate(3600-(timestamps_s%3600))
      }
      else {
         if(minutes < 10) {
            minutes="0" + minutes;
         }
         label_text=hours+":"+minutes;
         /* Come back next minute */
         this._set_refresh_rate(60-(timestamps_s%60));
      }
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
      Main.panel.addToStatusArea('8601date-indicator',_8601date_indicator_object);
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

