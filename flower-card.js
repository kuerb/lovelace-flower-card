customElements.whenDefined('card-tools').then(() => {
  var cardTools = customElements.get('card-tools');
  class FlowerCard extends cardTools.LitElement {

    async setConfig(config) {
      this.config = config;
    }

    static get styles() {
      return cardTools.LitCSS`
      ha-card {
        margin-top: 32px;
      }
      .attributes {
        padding: 8px;
      }
      .attribute ha-icon {
        float: left;
        margin-right: 4px;
      }
      .attribute {
        display: inline-block;
        width: calc(50% - 18px);
        white-space: normal;
        margin: 8px;
      }

      .header {
        padding-top: 8px;
        height: 72px;
      }
      .header > img {
        border-radius: 50%;
        width: 88px;
        margin-left: 16px;
        margin-right: 16px;
        margin-top: -32px;
        float: left;
        box-shadow: var( --ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2) );
      }
      .header > #name {
        font-weight: bold;
        width: 100%;
        margin-top: 16px;
        text-transform: capitalize;
        display: block;
      }
      .header > #species {
        text-transform: capitalize;
        color: #8c96a5;
        display: block;
      }
      .meter {
        height: 8px;
        background-color: #f1f1f1;
        border-radius: 2px;
        display: inline-grid;
        overflow: hidden;
      }
      .meter.red {
        width: 10%;
      }
      .meter.green {
        width: calc(80% - 24px - 12px);
      }
      .meter > span {
        grid-row: 1;
        grid-column: 1;
        height: 100%;
      }
      .meter > .good {
        background-color: rgba(43,194,83,1);
      }
      .meter > .bad {
        background-color: rgba(240,163,163);
      }
      .divider {
        height: 1px;
        background-color: #727272;
        opacity: 0.25;
        margin-left: 8px;
        margin-right: 8px;
      }
      .tooltip {
        position: relative;
      }
      .tooltip:after {
        opacity: 0;
        visibility: hidden;
        position: absolute;
        content: attr(data-tooltip);
        padding: 6px 10px;
        top: 1.4em;
        left: 50%;
        -webkit-transform: translateX(-50%) translateY(-180%);
                transform: translateX(-50%) translateY(-180%);
        background: grey;
        color: white;
        white-space: nowrap;
        z-index: 2;
        border-radius: 2px;
        transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), -webkit-transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
        transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
        transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), -webkit-transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
      }
      .tooltip:hover:after, .tooltip:active:after {
        display: block;
        opacity: 1;
        visibility: visible;
        -webkit-transform: translateX(-50%) translateY(-200%);
                transform: translateX(-50%) translateY(-200%);
      }
      `;
    }

    render() {
      if(!this.stateObj) {
	console.log("No plant found for entity " + this.config.entity);
        return cardTools.LitHtml``;
      }
      const species = this.stateObj.attributes.species;
      const limits = this.stateObj.attributes.limits;
      const attribute = (icon, attr, min, max) => {
        const unit = this.stateObj.attributes.unit_of_measurement_dict[attr];
        const val = this.stateObj.attributes[attr];
        const pct = 100*Math.max(0, Math.min(1, (val-min)/(max-min)));
        if (typeof val != "undefined"){
          return cardTools.LitHtml`
          <div class="attribute tooltip" data-tooltip="${val + " "+ unit + " | " + min + " ~ " + max + " " + unit}" @click="${() => cardTools.moreInfo(this.stateObj.attributes.sensors[attr])}">
            <ha-icon .icon="${icon}"></ha-icon>
            <div class="meter red">
              <span class="${val < min || val > max ? 'bad' : 'good'}" style="width: 100%;"></span>
            </div>
            <div class="meter green">
              <span class="${val > max ? 'bad' : 'good'}" style="width:${pct}%;"></span>
            </div>
            <div class="meter red">
              <span class="bad" style="width:${val > max ? 100 : 0}%;"></span>
            </div>
          </div>
          `;
              // ${val} (${min}-${max})
        }
      }

      return cardTools.LitHtml`
      <ha-card>
        <div class="header" @click="${() => cardTools.moreInfo(this.stateObj.entity_id)}">
          <img src="${this.stateObj.attributes.image}">
          <span id="name"> ${this.stateObj.attributes.name} </span>
          <span id="species">${species} </span>
        </div>
        <div class="divider"></div>
        <div class="attributes">
          ${attribute('mdi:thermometer', 'temperature', limits['min_temperature'], limits['max_temperature'])}
          ${attribute('mdi:white-balance-sunny', 'brightness', limits['min_brightness'], limits['max_brightness'])}
          ${attribute('mdi:water-percent', 'moisture', limits['min_moisture'], limits['max_moisture'])}
          ${attribute('mdi:leaf', 'conductivity', limits['min_conductivity'], limits['max_conductivity'])}
        </div>
      </ha-card>
      `;
    }

    set hass(hass) {
      this._hass = hass;
      this.stateObj = hass.states[this.config.entity];
      this.requestUpdate();
    }

  }

  customElements.define('flower-card', FlowerCard);
});

window.setTimeout(() => {
  if(customElements.get('card-tools')) return;
  customElements.define('flower-card', class extends HTMLElement{
    setConfig() { throw new Error("Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools");}
});

}, 2000);
