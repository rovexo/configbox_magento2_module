<?php

namespace Rovexo\Configbox\Model\Config\Source\Product\Options;

use Exception;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Data\OptionSourceInterface;
use Magento\Framework\Locale\Resolver;
use Magento\Framework\Message\ManagerInterface;
use Psr\Log\LoggerInterface;
use Rovexo\Configbox\Model\Prepare;

/**
 * Class ConfigBox
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ConfigBox implements OptionSourceInterface
{
    protected $prepareModel;

    protected $request;

    protected $resolver;

    protected $messageManager;

    protected $logger;

    /**
     * ConfigBox constructor.
     *
     * @param Prepare          $prepareModel   Prepare object
     * @param RequestInterface $request        Request object
     * @param Resolver         $resolver       Resolver object
     * @param ManagerInterface $messageManager Message Manager object
     * @param LoggerInterface  $logger         Logger object
     */
    public function __construct(
        Prepare $prepareModel,
        RequestInterface $request,
        Resolver $resolver,
        ManagerInterface $messageManager,
        LoggerInterface $logger
    ) {
        $this->prepareModel = $prepareModel;
        $this->request = $request;
        $this->resolver = $resolver;
        $this->messageManager = $messageManager;
        $this->logger = $logger;
    }

    /**
     * Convert into option array
     *
     * @return array
     */
    public function toOptionArray()
    {
        $cbProductsOptions = [];
        $cbProductsOptions[] = ['label' => __('--Please Select--'),'value' => ''];

        try {
            $allCbProducts = $this->prepareModel->getCbProducts();
            foreach ($allCbProducts as $cbProduct) {
                if ($cbProduct->id) {
                    $options['label'] = $this->getTitle($cbProduct);
                    $options['value'] = $cbProduct->id;
                    $cbProductsOptions[] = $options;
                }
            }
        } catch (Exception $e) {
            $this->logger->critical($e);
            $this->messageManager->addErrorMessage(
                __('An error occurred while loading configbox products.')
            );
        }
        return $cbProductsOptions;
    }

    /**
     * To get title based on locale code
     *
     * @param object $cbProduct configbox product info
     *
     * @return mixed
     */
    protected function getTitle($cbProduct)
    {
        $locale = $this->resolver->getLocale();
        $titleCode = 'title-' . $locale;
        $title = $cbProduct->title;
        if (isset($cbProduct->{$titleCode})) {
            $title = $cbProduct->{$titleCode};
        }
        return $title;
    }
}
