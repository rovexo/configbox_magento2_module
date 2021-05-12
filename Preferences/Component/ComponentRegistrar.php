<?php

namespace Rovexo\Configbox\Preferences\Component;

use Magento\Framework\Component\ComponentRegistrar as MagentoComponentRegistrar;
use Rovexo_Configbox_KenedoLoader;

class ComponentRegistrar extends MagentoComponentRegistrar
{
    /**
     * {@inheritdoc}
     */
    public function getPaths($type)
    {
        //Rovexo Customisation Start
        $kenedoLoader = new Rovexo_Configbox_KenedoLoader();
        $kenedoLoader->initKenedo();

        //Rovexo Customisation End
        return parent::getPaths($type);
    }
}
