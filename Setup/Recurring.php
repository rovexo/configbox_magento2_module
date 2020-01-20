<?php

namespace Rovexo\Configbox\Setup;

use Magento\Framework\Exception\FileSystemException;
use Magento\Framework\Setup\InstallSchemaInterface;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Filesystem\Driver\File;

/**
 * Class Recurring
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Recurring implements InstallSchemaInterface
{
    protected $directoryList;

    protected $file;

    /**
     * Recurring constructor.
     *
     * @param DirectoryList $directoryList DirectoryList object
     * @param File $file
     */
    public function __construct(
        DirectoryList $directoryList,
        File $file
    ) {
        $this->directoryList = $directoryList;
        $this->file = $file;
    }

    /**
     * Implementation of install()
     *
     * @param SchemaSetupInterface $setup SchemaSetup object
     * @param ModuleContextInterface $context Context object
     *
     * @return void
     */
    public function install(
        SchemaSetupInterface $setup,
        ModuleContextInterface $context
    ) {
        $sourceDir = $this->directoryList->getRoot() . DIRECTORY_SEPARATOR .
            "vendor" . DIRECTORY_SEPARATOR . "rovexo" . DIRECTORY_SEPARATOR .
            "configbox-php" . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR .
            "Rovexo" . DIRECTORY_SEPARATOR . "Configbox" . DIRECTORY_SEPARATOR .
            "assets";

        $targetDir = $this->directoryList->getPath(DirectoryList::LIB_WEB) .
            DIRECTORY_SEPARATOR . "rovexo" . DIRECTORY_SEPARATOR . "configbox" .
            DIRECTORY_SEPARATOR . "assets";

        //  During development, it will be symlink and not a directory
        try {
            if (!is_link($targetDir)) {
                if ($this->file->isExists($targetDir)) {
                    $this->file->deleteDirectory($targetDir);
                }

                $this->file->createDirectory($targetDir, 0775);

                $this->_copyDirectory($sourceDir, $targetDir);
            }
        } catch (FileSystemException $e) {
            throw new FileSystemException(
                new \Magento\Framework\Phrase("\nThe directory 'lib/web/rovexo' could not be recreated. Please make sure this dir is writable and run setup:upgrade again.")
            );
        }
    }

    /**
     * Copy directory
     *
     * @param string $src Source
     * @param string $dst Destination
     *
     * @return void
     */
    private function _copyDirectory($src, $dst)
    {
        // open the source directory
        $dir = opendir($src);

        // Make the destination directory if not exist
        if (!file_exists($dst)) {
            $this->file->createDirectory($dst, 0775);
        }

        // Loop through the files in source directory
        foreach (scandir($src) as $file) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . DIRECTORY_SEPARATOR . $file)) {
                    // Recursively calling copyDirectory method for sub directory
                    $this->_copyDirectory(
                        $src . DIRECTORY_SEPARATOR . $file,
                        $dst . DIRECTORY_SEPARATOR . $file
                    );
                } else {
                    copy(
                        $src . DIRECTORY_SEPARATOR . $file,
                        $dst . DIRECTORY_SEPARATOR . $file
                    );
                }
            }
        }

        closedir($dir);
    }
}
