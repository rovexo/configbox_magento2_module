<?php

namespace Rovexo\Configbox\Preferences\Component;

use Magento\Framework\Component\ComponentRegistrar as MagentoComponentRegistrar;
//use Rovexo_Configbox_KenedoLoader;

class ComponentRegistrar extends MagentoComponentRegistrar
{
    /**
     * {@inheritdoc}
     */
    public function getPaths($type)
    {
        // For the CB customization module to work during setup:di:compile, we need to load Kenedo
//        $kenedoLoader = new Rovexo_Configbox_KenedoLoader();
//        $kenedoLoader->initKenedo();
        return parent::getPaths($type);
    }
}
