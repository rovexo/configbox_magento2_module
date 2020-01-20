define(
    [
    'underscore',
    'uiRegistry'
    ], function (_, registry) {
        'use strict';

        let mixin = {
            updateComponents: function (currentValue, isInitialization) {
                let currentGroup = this.valuesMap[currentValue];

                if (currentGroup !== this.previousGroup) {
                    _.each(
                        this.indexesMap, function (groups, index) {
                            let template = this.filterPlaceholder + ', index = ' + index,
                                visible = groups.indexOf(currentGroup) !== -1,
                                component;

                            switch (index) {
                                case 'container_type_static':
                                case 'values':
                                case 'container_config_box':
                                    template = 'ns=' + this.ns +
                                    ', dataScope=' + this.parentScope +
                                    ', index=' + index;
                                    break;
                            }

                            /*eslint-disable max-depth */
                            if (isInitialization) {
                                registry.async(template)(
                                    function (currentComponent) {
                                        currentComponent.visible(visible);
                                    }
                                );
                            } else {
                                component = registry.get(template);

                                if (component) {
                                    component.visible(visible);
                                }
                            }
                        }, this
                    );

                    this.previousGroup = currentGroup;
                }

                return this;
            }
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);
