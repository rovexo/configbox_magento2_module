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

        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $state =  $objectManager->get('Magento\Framework\App\State');
        try {
            $state->getAreaCode();
        }
        catch (\Exception $e) {
            $state->setAreaCode(\Magento\Framework\App\Area::AREA_FRONTEND);
        }
        
        //Rovexo Customisation Start
        $kenedoLoader = new Rovexo_Configbox_KenedoLoader();
        $kenedoLoader->initKenedo();

        //Rovexo Customisation End
        return parent::getPaths($type);
    }
}
