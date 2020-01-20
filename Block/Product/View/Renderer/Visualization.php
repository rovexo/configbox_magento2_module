<?php

namespace Rovexo\Configbox\Block\Product\View\Renderer;

use Magento\Framework\View\Element\Template;
use Rovexo\Configbox\Model\Prepare;
use Magento\Framework\Registry;

/**
 * Class Visualization
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Visualization extends Template
{
    protected $prepare;

    protected $registry;

    /**
     * Visualization constructor.
     *
     * @param Template\Context $context  Context object
     * @param Prepare          $prepare  Prepare object
     * @param Registry         $registry Registry object
     * @param array            $data     Data array
     */
    public function __construct(
        Template\Context $context,
        Prepare $prepare,
        Registry $registry, //  @TODO: Replace deprecated code
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->prepare = $prepare;
        $this->registry = $registry;
    }

    /**
     * Prepare configurator
     *
     * @return void
     */
    public function prepare()
    {
        $this->prepare->prepareConfigurator();
    }

    public function hasCbCustomOption()
    {
        $mageProduct = $this->registry->registry('current_product');
        $mageProductId = $mageProduct->getId();
        $cbProductId = $this->getCbProductId($mageProductId);

        return $cbProductId ? true : false;
    }
}
