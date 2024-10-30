<?php
class mtg_util_admin_input_fields{

    /**
    * Takes a slug and replaces dashes and underscores with spaces and then makes the first letter of each word uppercase
    *
    * @since 1.0
    *
    * @param string $slug Slug to convert to a label
    * @param string $label Existing label. Default value is false
    * @return string $slug converted into a more human-readable label
    */
    public function generate_label($slug, $label=false){
        if( $label == false ){
            return ucwords(str_replace(array('-', '_'), ' ', $slug));
        } else{
            return $label;
        }
    }//end generate_label

    /**
    * Returns a WordPress formatted text input field
    *
    * @since 1.0
    * @uses generate_label() This function converts a slug into a human-readable value
    *
    * @param string $slug Slug to used as the key for the options array stored in the database
    * @param string $label Optional label for the input. If not passed or is false a label will be generated from $slug
    * @param string $description Optional description for the input. Appears underneath the input.
    * @return none directly echo's the input HTML
    */
    public function text($slug=false, $label=false, $description=false){
        //If no slug is specified bail
        if( $slug == false ){
            return false;
        }
        $mtg_util_options = get_option(MTG_UTIL_OPTIONS);
        //Generate label
        $label = $this->generate_label($slug, $label);
        ?>
        <tr valign="top">
            <th scope="row">
                <label for="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>"><?php echo $label; ?></label>
            </th>
            <td>
                <input name="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>" type="text" id="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>" value="<?php echo $mtg_util_options[$slug]; ?>" class="regular-text">
            <?php
            //If description is defined print it
            if( $description !== false ){
                echo "<p class='description'>$description</p>";
            }
            ?>
            </td>
        </tr>
        <?php
    }//end text

    /**
    * Returns a WordPress formatted textarea input field
    *
    * @since 1.0
    * @uses generate_label() This function converts a slug into a human-readable value
    *
    * @param string $slug Slug to used as the key for the options array stored in the database
    * @param string $label Optional label for the input. If not passed or is false a label will be generated from $slug
    * @param string $description Optional description for the input. Appears underneath the input.
    * @return none directly echo's the input HTML
    */
    public function textarea($slug=false, $label=false, $description=false){
        //If no slug is specified bail
        if( $slug == false ){
            return false;
        }
        $mtg_util_options = get_option(MTG_UTIL_OPTIONS);
        //Generate label
        $label = $this->generate_label($slug, $label);
        ?>
        <tr valign="top">
            <th scope="row">
                <label for="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>"><?php echo $label; ?></label>
            </th>
            <td>
                <textarea name="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>" rows="5" cols="25" id="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>" class="large-text code"><?php echo $mtg_util_options[$slug]; ?></textarea>
            <?php
            //If description is defined print it
            if( $description !== false ){
                echo "<p class='description'>$description</p>";
            }
            ?>
            </td>
        </tr>
        <?php
    }//end textarea

    /**
    * Returns a WordPress formatted page select input
    *
    * @since 1.0
    * @uses generate_label() This function converts a slug into a human-readable value
    *
    * @param string $slug Slug to used as the key for the options array stored in the database
    * @param string $label Optional label for the input. If not passed or is false a label will be generated from $slug
    * @param string $description Optional description for the input. Appears underneath the input.
    * @return none directly echo's the input HTML
    */
    public function page_select($slug=false, $label=false, $description=false){
        //If no slug is specified bail
        if( $slug == false ){
          return false;
        }
        $mtg_util_options = get_option(MTG_UTIL_OPTIONS);
        //Generate label
        $label = $this->generate_label($slug, $label);
        $args = array(
            'depth' => 0,
            'child_of' => 0,
            'selected' => 0,
            'echo' => 1,
            'name' => MTG_UTIL_OPTIONS . '[' . $slug . ']'
        );
        //If option is not set default to ID of 0
        if( empty($mtg_util_options[$slug]) OR !isset($mtg_util_options[$slug]) ){
            $mtg_util_options[$slug] = 0;
        //Otherwise define make the existing ID selected
        } elseif( $mtg_util_options[$slug] > 0 ){
            $args['selected'] = $mtg_util_options[$slug];
        }
        ?>
        <tr valign="top">
            <th scope="row"><label for="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>"><?php echo $label; ?></label></th>
            <td>
                <?php
                wp_dropdown_pages($args);
                //If description is defined print it
                if( $description !== false ){
                    echo "<p class='description'>$description</p>";
                }
                ?>
            </td>
        </tr>
    <?php
    }//end page_select

    /**
    * Returns a WordPress formatted select input field
    *
    * @since 1.0
    * @uses generate_label() This function converts a slug into a human-readable value
    *
    * @param string $slug Slug to used as the key for the options array stored in the database
    * @param array $options Formatted array as $label=>$value to be used as select choices
    * @param string $label Optional label for the input. If not passed or is false a label will be generated from $slug
    * @param string $description Optional description for the input. Appears underneath the input.
    * @return none directly echo's the input HTML
    */
    public function select($slug=false, $options=false, $label=false, $description=false){
        //If no slug is specified bail
        if( $slug == false ){
          return false;
        }
        //If options is not an array bail
        if( !array($options) OR $options == false ){
            return false;
        }
        $mtg_util_options = get_option(MTG_UTIL_OPTIONS);
        //Generate label
        $label = $this->generate_label($slug, $label);
        ?>
        <tr valign="top">
            <th scope="row"><label for="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>"><?php echo $label; ?></label></th>
            <td>
                <select name="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>" id="<?php echo MTG_UTIL_OPTIONS . '[' . $slug . ']'; ?>">
                    <option value="">Select an Option</option>
                    <?php
                    foreach($options as $label=>$value){
                        echo "<option value='$value'";
                        //If current option is saved value make it selected
                        if( $value == $mtg_util_options[$slug] AND $mtg_util_options[$slug] !== '' ){
                            echo ' selected="selected"';
                        }
                        echo ">$label</option>";
                    }
                    ?>
                </select>
                <?php
                //If description is defined print it
                if( $description !== false ){
                    echo "<p class='description'>$description</p>";
                }
                ?>
            </td>
        </tr>
    <?php
    }//end select

    /**
    * Returns a WordPress formatted radio input field
    *
    * @since 1.0
    * @uses generate_label() This function converts a slug into a human-readable value
    *
    * @param string $slug Slug to used as the key for the options array stored in the database
    * @param array $options Formatted array as $label=>$value to be used as select choices
    * @param string $label Optional label for the input. If not passed or is false a label will be generated from $slug
    * @param string $description Optional description for the input. Appears underneath the input.
    * @return none directly echo's the input HTML
    */
    public function radio($slug=false, $options=false, $label=false, $description=false){
        //If no slug is specified bail
        if( $slug == false ){
          return false;
        }
        //If options is not an array bail
        if( !array($options) OR $options == false ){
            return false;
        }
        $mtg_util_options = get_option(MTG_UTIL_OPTIONS);
        //Generate label
        $label = $this->generate_label($slug, $label);
        ?>
        <tr valign="top">
            <th scope="row"><?php echo $label; ?></th>
            <td>
                <fieldset>
                    <legend class="screen-reader-text"><span><?php echo $label;?></span></legend>
                    <?php
                    $count = 1;
                    foreach($options as $label=>$value){
                        echo '<label title="' . $value . '"><input type="radio" name="' . MTG_UTIL_OPTIONS . '[' . $slug . ']" value="' . $value . '"';
                        if( $value == $mtg_util_options[$slug] AND $mtg_util_options[$slug] !== '' ){
                            echo ' checked="checked"';
                        }
                        echo '> <span>' . $label . '</span></label>';
                        if( $count < count($options) ){
                            echo '<br />';
                        }
                        $count++;
                    }
                    ?>
                </fieldset>
                <?php
                //If description is defined print it
                if( $description !== false ){
                    echo "<p class='description'>$description</p>";
                }
                ?>
            </td>
        </tr>
        <?php
    }//end radio

    /**
    * Returns a WordPress formatted checkbox input field
    *
    * @since 1.0
    * @uses generate_label() This function converts a slug into a human-readable value
    *
    * @param string $slug Slug to used as the key for the options array stored in the database
    * @param string $label Optional label for the input. If not passed or is false a label will be generated from $slug
    * @param string $description Optional description for the input. Appears underneath the input.
    * @return none directly echo's the input HTML
    */
    public function checkbox($slug=false, $label=false, $description=false){
        //If no slug is specified bail
        if( $slug == false ){
          return false;
        }
        $mtg_util_options = get_option(MTG_UTIL_OPTIONS);
        //Generate label
        $label = $this->generate_label($slug, $label);
        ?>
        <tr valign="top">
            <th scope="row"><?php echo $label; ?></th>
            <td>
                <fieldset>
                    <legend class="screen-reader-text"><span><?php echo $label;?></span></legend>
                    <?php
                    echo '<label title="' . $value . '"><input type="checkbox" name="' . MTG_UTIL_OPTIONS . '[' . $slug . ']" value="1"';
                    if( $mtg_util_options[$slug] == 1 ){
                        echo ' checked="checked"';
                    }
                    echo '> <span>' . $label . '</span></label>';
                    ?>
                </fieldset>
                <?php
                //If description is defined print it
                if( $description !== false ){
                    echo "<p class='description'>$description</p>";
                }
                ?>
            </td>
        </tr>
        <?php
    }//end checkbox
}//end mtg_util_admin_input_fields
?>