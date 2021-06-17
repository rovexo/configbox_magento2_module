<?php

namespace Rovexo\Configbox\Preferences\Component;

use Magento\Framework\Component\ComponentRegistrar as MagentoComponentRegistrar;

class ComponentRegistrar extends MagentoComponentRegistrar
{
    /**
     * {@inheritdoc}
     */
    public function getPaths($type)
    {
        return parent::getPaths($type);
    }
}
